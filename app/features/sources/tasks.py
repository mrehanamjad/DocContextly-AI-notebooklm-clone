# """Background tasks for source indexing."""

# import asyncio
# import os
# import tempfile
# import uuid
# from typing import List, Any
# from datetime import datetime

# from qdrant_client.models import PointStruct

# from app.core.ai_clients import get_qdrant_client, get_embeddings
# from app.core.config import settings
# from app.core.logger import logger
# from app.database.session import AsyncSessionLocal
# from app.features.sources.model import SourceType, SourceStatus
# from app.features.sources.repository import SourceRepository
# from app.features.sources.loader import load_file
# from app.features.sources.chunker import generate_markdown, smart_chunk
# from app.features.sources.helpers import ensure_collection

# def batched(iterable: List[Any], n: int):
#     """Yield successive n-sized chunks from a list."""
#     for i in range(0, len(iterable), n):
#         yield iterable[i:i + n]


# async def index_source_background(
#     source_id: str,
#     source_type: SourceType,
#     user_id: uuid.UUID,
#     notebook_id: uuid.UUID,
#     **kwargs,
# ) -> None:
#     """Generic background indexer for all source types."""
#     async with AsyncSessionLocal() as db:
#         source_repo = SourceRepository(db)

#         try:
#             # ─── 1. Extract Text Depending on Source Type ────────────────────────
#             if source_type == SourceType.UPLOAD:
#                 file_path = kwargs.get("file_path")
#                 file_name = kwargs.get("file_name")
#                 if not file_path or not os.path.exists(file_path):
#                     raise ValueError("File path missing or invalid for upload")
#                 try:
#                     docs = load_file(file_path, file_name)
#                     markdown_text = generate_markdown(docs, file_name)
#                 finally:
#                     os.unlink(file_path)  # clean up temporary file
#                 title = file_name

#             elif source_type in (SourceType.WEBSITE, SourceType.YOUTUBE):
#                 content = kwargs.get("content") 
#                 title = kwargs.get("title")
#                 markdown_text = content

#             elif source_type == SourceType.NOTE:
#                 text = kwargs.get("text")
#                 markdown_text = text
#                 title = kwargs.get("title", "Note")

#             else:
#                 raise ValueError(f"Unsupported source type: {source_type}")

#             # ─── 2. Generate Chunks ──────────────────────────────────────────────
#             chunks = smart_chunk(markdown_text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)

#             logger.info(
#                 f"Generated {len(chunks)} chunks for source {source_id}"
#             )

#             if chunks:
#                 logger.info(
#                     f"Smallest chunk: {min(len(c['text']) for c in chunks)} chars"
#                 )

#                 logger.info(
#                     f"Largest chunk: {max(len(c['text']) for c in chunks)} chars"
#                 )

#                 logger.info(
#                     f"First chunk preview: {chunks[0]['text'][:200]}"
#                 )

#             if not chunks:
#                 await source_repo.update_status(source_id, notebook_id, SourceStatus.READY, total_chunks=0)
#                 return

#             embeddings = get_embeddings()
#             client = get_qdrant_client()
#             collection = settings.QDRANT_COLLECTION

#             # Get the first vector to ensure collection schema exists
#             first_vector = await asyncio.to_thread(embeddings.embed_query, chunks[0]['text'])
#             ensure_collection(client, collection, len(first_vector))

#             # ─── 3. Process in Safe Batches ──────────────────────────────────────
#             # 150 is optimal: avoids embedding API limits AND Qdrant payload limits
#             BATCH_SIZE = 50 
#             total_points = 0

#             for chunk_batch in batched(chunks, BATCH_SIZE):
#                 # Isolate text strings for bulk embedding
#                 batch_texts = [c['text'] for c in chunk_batch]
                
#                 # Bulk embed the entire batch at once (Much faster than looping)
#                 batch_vectors = await asyncio.to_thread(embeddings.embed_documents, batch_texts)

#                 points: List[PointStruct] = []
#                 for i, chunk in enumerate(chunk_batch):
#                     global_idx = total_points + i
#                     points.append(
#                         PointStruct(
#                             id=str(uuid.uuid4()),
#                             vector=batch_vectors[i],
#                             payload={
#                                 'source_id': source_id,
#                                 'source_type': source_type.value,
#                                 'title': title,
#                                 'chunk_index': global_idx,
#                                 'chunk_text': chunk['text'],
#                                 'page_number': chunk.get('page_number', 1),
#                                 'is_table': chunk.get('is_table', False),
#                                 'user_id': str(user_id),
#                                 'notebook_id': str(notebook_id),
#                                 'file_name': kwargs.get('file_name', title),
#                             },
#                         )
#                     )

#                 # Upsert this specific batch in a thread to prevent blocking the event loop
#                 await asyncio.to_thread(client.upsert, collection_name=collection, points=points)
#                 total_points += len(points)
#                 logger.debug(f"Upserted batch of {len(points)} chunks for source {source_id}")

#             # ─── 4. Mark as Ready ────────────────────────────────────────────────
#             await source_repo.update_status(
#                 source_id, notebook_id, SourceStatus.READY,
#                 total_chunks=total_points,
#             )
#             logger.info(f"Successfully indexed all {total_points} chunks for source {source_id} ({source_type})")

#         except Exception as e:
#             logger.error(f"Indexing failed for {source_id}: {e}", exc_info=True)
#             await source_repo.update_status(source_id, notebook_id, SourceStatus.ERROR, error_message=str(e))



"""Background tasks for source indexing."""

import asyncio
import os
import uuid
import tempfile
import urllib.request
from typing import List, Any
from datetime import datetime

from qdrant_client.models import PointStruct

from app.core.ai_clients import get_qdrant_client, get_embeddings
from app.core.config import settings
from app.core.logger import logger
from app.database.session import AsyncSessionLocal
from app.features.sources.model import SourceType, SourceStatus
from app.features.sources.repository import SourceRepository
from app.features.sources.loader import load_file
from app.features.sources.chunker import generate_markdown, smart_chunk
from app.features.sources.helpers import ensure_collection

def batched(iterable: List[Any], n: int):
    """Yield successive n-sized chunks from a list."""
    for i in range(0, len(iterable), n):
        yield iterable[i:i + n]

def _sync_extract_and_chunk(file_path: str, file_name: str, chunk_size: int, chunk_overlap: int) -> list[dict]:
    """
    Helper function to run all heavy synchronous file I/O and CPU-bound regex parsing.
    This MUST be run in a thread to prevent blocking the async event loop.
    """
    try:
        docs = load_file(file_path, file_name)
        markdown_text = generate_markdown(docs, file_name)
        return smart_chunk(markdown_text, chunk_size, chunk_overlap)
    finally:
        # Safe cleanup: Only attempt to delete if the file actually exists
        if file_path and os.path.exists(file_path):
            try:
                os.unlink(file_path)
            except OSError as e:
                logger.warning(f"Failed to delete temp file {file_path}: {e}")

async def index_source_background(
    source_id: str,
    source_type: SourceType,
    user_id: uuid.UUID,
    notebook_id: uuid.UUID,
) -> None:
    """Generic background indexer for all source types (Distributed-safe)."""
    async with AsyncSessionLocal() as db:
        source_repo = SourceRepository(db)

        try:
            # ─── 0. Fetch Source from DB (Payload Minimization) ────────────────
            source = await source_repo.get_in_notebook(source_id, user_id, notebook_id)
            if not source:
                raise ValueError(f"Source {source_id} not found in DB")

            # ─── 1. Extract Text & Chunk (Safely Offloaded) ──────────────────────
            if source_type == SourceType.UPLOAD:
                file_name = source.source_data.get("file_name", "unknown")
                imagekit_url = source.source_data.get("imagekit_url")

                if not imagekit_url:
                    raise ValueError("Missing imagekit_url in source_data")

                # Create a local temp file specifically for this worker instance
                ext = os.path.splitext(file_name)[1]
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
                temp_path = temp_file.name
                temp_file.close()

                try:
                    # Download the file from ImageKit
                    await asyncio.to_thread(urllib.request.urlretrieve, imagekit_url, temp_path)

                    # Offload the heavy PDF parsing and chunking to a thread pool!
                    chunks = await asyncio.to_thread(
                        _sync_extract_and_chunk, 
                        temp_path, 
                        file_name, 
                        settings.CHUNK_SIZE, 
                        settings.CHUNK_OVERLAP
                    )
                    title = source.title or file_name
                except Exception:
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
                    raise

            elif source_type in (SourceType.WEBSITE, SourceType.YOUTUBE, SourceType.NOTE):
                markdown_text = source.source_data.get("content")
                title = source.title or "Note"
                
                if not markdown_text:
                    raise ValueError("No content provided in source_data for processing.")

                # Even for raw text, regex chunking is CPU-bound. Offload it!
                chunks = await asyncio.to_thread(
                    smart_chunk, 
                    markdown_text, 
                    settings.CHUNK_SIZE, 
                    settings.CHUNK_OVERLAP
                )

            else:
                raise ValueError(f"Unsupported source type: {source_type}")

            logger.info(f"Generated {len(chunks)} chunks for source {source_id}")

            # Early exit if the file contained no parsable text (e.g., an image-only PDF)
            if not chunks:
                logger.warning(f"Source {source_id} yielded 0 chunks. Marking as READY with 0 content.")
                await source_repo.update_status(source_id, notebook_id, SourceStatus.READY, total_chunks=0)
                return

            # ─── 2. Setup Vector Store ───────────────────────────────────────────
            embeddings = get_embeddings()
            client = get_qdrant_client()
            collection = settings.QDRANT_COLLECTION

            # Get the first vector to ensure collection schema exists
            first_vector = await asyncio.to_thread(embeddings.embed_query, chunks[0]['text'])
            ensure_collection(client, collection, len(first_vector))

            # ─── 3. Process in Safe Batches ──────────────────────────────────────
            BATCH_SIZE = 50 
            total_points = 0

            for chunk_batch in batched(chunks, BATCH_SIZE):
                batch_texts = [c['text'] for c in chunk_batch]
                
                # Bulk embed the entire batch at once
                batch_vectors = await asyncio.to_thread(embeddings.embed_documents, batch_texts)

                points: List[PointStruct] = []
                for i, chunk in enumerate(chunk_batch):
                    global_idx = total_points + i
                    points.append(
                        PointStruct(
                            id=str(uuid.uuid4()),
                            vector=batch_vectors[i],
                            payload={
                                'source_id': source_id,
                                'source_type': source_type.value,
                                'title': title,
                                'chunk_index': global_idx,
                                'chunk_text': chunk['text'],
                                'page_number': chunk.get('page_number', 1),
                                'is_table': chunk.get('is_table', False),
                                'user_id': str(user_id),
                                'notebook_id': str(notebook_id),
                                'file_name': title,
                            },
                        )
                    )

                # Upsert to Qdrant without blocking the event loop
                await asyncio.to_thread(client.upsert, collection_name=collection, points=points)
                total_points += len(points)
                logger.debug(f"Upserted batch of {len(points)} chunks for source {source_id}")

            # ─── 4. Mark as Ready ────────────────────────────────────────────────
            await source_repo.update_status(
                source_id, notebook_id, SourceStatus.READY,
                total_chunks=total_points,
            )
            logger.info(f"Successfully indexed all {total_points} chunks for source {source_id} ({source_type})")

        except Exception as e:
            logger.error(f"Indexing failed for {source_id}: {e}", exc_info=True)
            # Safe fallback: Ensure we always write the error state to the database
            await source_repo.update_status(source_id, notebook_id, SourceStatus.ERROR, error_message=str(e))
            raise