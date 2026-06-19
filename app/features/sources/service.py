# """Source service — supports upload, website, YouTube, topic, note."""

# from app.features.sources.tasks import index_source_background
# import uuid
# import hashlib
# import tempfile
# import aiofiles  
# import os
# from typing import List, Optional
# from datetime import datetime

# import asyncio
# from fastapi import UploadFile
# from sqlalchemy.ext.asyncio import AsyncSession
# from qdrant_client.models import PointStruct, VectorParams, Distance, Filter, FieldCondition, MatchValue, PayloadSchemaType

# from app.core.config import settings
# from app.core.ai_clients import get_qdrant_client, get_embeddings, get_vector_size
# from app.core.logger import logger
# from app.core.exceptions import NotFoundException, ValidationError
# from app.core.providers.storage import get_storage_provider

# from app.features.notebooks.service import NotebookService
# from app.features.sources.repository import SourceRepository
# from app.features.sources.model import Source, SourceType, SourceStatus
# from app.features.sources.schema import (
#     SourceUploadResponse, SourceListResponse, SourceResponse,
#     SourceDeleteResponse, SourceStatusResponse, NoteCreateRequest,
# )
# from app.features.sources.loader import load_file, is_supported
# from app.features.sources.chunker import generate_markdown, smart_chunk
# from app.features.sources.helpers import ensure_collection, collection_exists

# from app.database.session import AsyncSessionLocal

# class SourceService:
#     def __init__(self, db: AsyncSession):
#         self.db = db
#         self.source_repo = SourceRepository(db)
#         self.notebook_service = NotebookService(db)
#         self.storage = get_storage_provider()

#     # ---- Upload source ----
#     async def create_upload_source(
#         self, file: UploadFile, notebook_id: uuid.UUID, user_id: uuid.UUID
#     ) -> SourceUploadResponse:
#         await self.notebook_service.get_notebook(notebook_id, user_id)

#         file_name = file.filename or "unknown"
#         if not is_supported(file_name):
#             raise ValidationError(f"Unsupported file type: {file_name}")

#         # ── 1. Create a SINGLE temp file (streaming) ──────────────────────────
#         ext = os.path.splitext(file_name)[1]
#         temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
#         temp_path = temp_file.name

#         try:
#             # Stream the uploaded file to disk asynchronously
#             async with aiofiles.open(temp_path, 'wb') as out_file:
#                 while chunk := await file.read(1024 * 1024):  # 1 MB chunks
#                     await out_file.write(chunk)
#         except Exception as e:
#             os.unlink(temp_path)  # Clean up if streaming fails
#             raise ValidationError(f"Failed to save uploaded file: {e}")

#         # ── 2. Compute hash from the temp file (avoid reading into memory) ────
#         hasher = hashlib.md5()
#         async with aiofiles.open(temp_path, 'rb') as f:
#             while chunk := await f.read(8192):
#                 hasher.update(chunk)
#         source_id = hasher.hexdigest()

#         # ── 3. Duplicate check ──────────────────────────────────────────────────
#         existing = await self.source_repo.get_by_source_id(source_id, user_id)
#         if existing:
#             os.unlink(temp_path)  # Delete temp file, no need to keep it
#             return SourceUploadResponse(
#                 id=existing.id, source_id=source_id, title=existing.title,
#                 source_type=existing.source_type, status=existing.status,
#                 message="Source already uploaded.",
#             )

#         # ── 4. Upload to ImageKit (using the temp file path) ──────────────────
#         try:
#             upload_result = self.storage.upload_file(
#                 temp_path,  # Pass the path directly
#                 file_name,
#                 folder=f"sources/{notebook_id}"
#             )
#         except Exception as e:
#             os.unlink(temp_path)  # Clean up if ImageKit fails
#             logger.error(f"ImageKit upload failed: {e}")
#             raise ValidationError(f"Failed to store file: {e}")

#         # ── 5. Save to DB ──────────────────────────────────────────────────────
#         file_size = os.path.getsize(temp_path)
#         file_type = ext.lstrip('.')
#         source_data = {
#             "file_name": file_name,
#             "file_type": file_type,
#             "file_size_bytes": file_size,
#             "imagekit_file_id": upload_result.get("file_id"),
#             "imagekit_url": upload_result.get("url"),
#             "thumbnail_url": upload_result.get("thumbnail_url"),
#             "page_count": 0,
#             "word_count": 0,
#         }

#         source = Source(
#             notebook_id=notebook_id,
#             user_id=user_id,
#             source_id=source_id,
#             source_type=SourceType.UPLOAD,
#             title=file_name,
#             status=SourceStatus.PROCESSING,
#             source_data=source_data,
#         )
#         source = await self.source_repo.create(source)

#         # ── 6. Spawn background task & pass the temp file path ────────────────
#         asyncio.create_task(
#             index_source_background(
#                 source_id=source_id,
#                 source_type=SourceType.UPLOAD,
#                 user_id=user_id,
#                 notebook_id=notebook_id,
#                 file_path=temp_path,          # Pass the path, not the bytes!
#                 file_name=file_name,
#             )
#         )

#         # ⚠️ IMPORTANT: Do NOT delete temp_path here. The background task owns it now.

#         return SourceUploadResponse(
#             id=source.id,
#             source_id=source_id,
#             title=source.title,
#             source_type=SourceType.UPLOAD,
#             status=SourceStatus.PROCESSING,
#             message="Source uploaded. Indexing in background.",
#         )


#     # ---- Website source ----
#     async def create_website_source(
#         self, url: str, notebook_id: uuid.UUID, user_id: uuid.UUID, title: Optional[str] = None
#     ) -> SourceUploadResponse:
#         """Fetch and index a website."""
#         await self.notebook_service.get_notebook(notebook_id, user_id)

#         # Generate source_id from URL
#         source_id = hashlib.md5(url.encode()).hexdigest()
#         existing = await self.source_repo.get_by_source_id(source_id, user_id)
#         if existing:
#             return SourceUploadResponse(
#                 id=existing.id, source_id=source_id, title=existing.title,
#                 source_type=SourceType.WEBSITE, status=existing.status,
#                 message="Website already added.",
#             )

#         # Fetch content (simplified; implement real extraction)
#         # For demo, we'll just store URL and start background processing
#         source_data = {
#             "url": url,
#             "domain": "example.com",  # will be filled in background
#             "extracted_at": datetime.utcnow().isoformat(),
#             "content_cleaned": True,
#             "word_count": 0,
#             "headings": [],
#         }

#         source = Source(
#             notebook_id=notebook_id,
#             user_id=user_id,
#             source_id=source_id,
#             source_type=SourceType.WEBSITE,
#             title=title or url,
#             status=SourceStatus.PROCESSING,
#             source_data=source_data,
#         )
#         source = await self.source_repo.create(source)

#         # Background indexing
#         asyncio.create_task(
#             index_source_background(
#                 source_id=source_id,
#                 source_type=SourceType.WEBSITE,
#                 user_id=user_id,
#                 notebook_id=notebook_id,
#                 url=url,
#             )
#         )

#         return SourceUploadResponse(
#             id=source.id,
#             source_id=source_id,
#             title=source.title,
#             source_type=SourceType.WEBSITE,
#             status=SourceStatus.PROCESSING,
#             message="Website added. Indexing in background.",
#         )

#     # ---- YouTube source ----
#     async def create_youtube_source(
#         self, url: str, notebook_id: uuid.UUID, user_id: uuid.UUID, title: Optional[str] = None
#     ) -> SourceUploadResponse:
#         """Fetch and index a YouTube video transcript."""
#         await self.notebook_service.get_notebook(notebook_id, user_id)

#         # Extract video ID (simplified)
#         video_id = url.split("v=")[-1].split("&")[0] if "v=" in url else url
#         source_id = hashlib.md5(video_id.encode()).hexdigest()
#         existing = await self.source_repo.get_by_source_id(source_id, user_id)
#         if existing:
#             return SourceUploadResponse(
#                 id=existing.id, source_id=source_id, title=existing.title,
#                 source_type=SourceType.YOUTUBE, status=existing.status,
#                 message="YouTube video already added.",
#             )

#         source_data = {
#             "url": url,
#             "video_id": video_id,
#             "channel_name": "Unknown",
#             "duration_seconds": 0,
#             "view_count": 0,
#             "published_date": None,
#             "thumbnail_url": None,
#             "language": "en",
#         }

#         source = Source(
#             notebook_id=notebook_id,
#             user_id=user_id,
#             source_id=source_id,
#             source_type=SourceType.YOUTUBE,
#             title=title or f"YouTube: {video_id}",
#             status=SourceStatus.PROCESSING,
#             source_data=source_data,
#         )
#         source = await self.source_repo.create(source)

#         asyncio.create_task(
#             index_source_background(
#                 source_id=source_id,
#                 source_type=SourceType.YOUTUBE,
#                 user_id=user_id,
#                 notebook_id=notebook_id,
#                 url=url,
#             )
#         )

#         return SourceUploadResponse(
#             id=source.id,
#             source_id=source_id,
#             title=source.title,
#             source_type=SourceType.YOUTUBE,
#             status=SourceStatus.PROCESSING,
#             message="YouTube video added. Indexing in background.",
#         )

#     # ---- Topic source ----
#     async def create_topic_source(
#         self, topic: str, notebook_id: uuid.UUID, user_id: uuid.UUID
#     ) -> SourceUploadResponse:
#         """Generate a research document on a topic using LLM."""
#         await self.notebook_service.get_notebook(notebook_id, user_id)

#         source_id = hashlib.md5(topic.encode()).hexdigest()
#         existing = await self.source_repo.get_by_source_id(source_id, user_id)
#         if existing:
#             return SourceUploadResponse(
#                 id=existing.id, source_id=source_id, title=existing.title,
#                 source_type=SourceType.TOPIC, status=existing.status,
#                 message="Topic already added.",
#             )

#         source_data = {
#             "topic": topic,
#             "research_depth": "standard",
#             "sources_used": [],
#             "citations": [],
#             "word_count": 0,
#             "generated_by": settings.LLM_MODEL,
#             "generated_at": datetime.utcnow().isoformat(),
#         }

#         source = Source(
#             notebook_id=notebook_id,
#             user_id=user_id,
#             source_id=source_id,
#             source_type=SourceType.TOPIC,
#             title=topic,
#             status=SourceStatus.PROCESSING,
#             source_data=source_data,
#         )
#         source = await self.source_repo.create(source)

#         asyncio.create_task(
#             index_source_background(
#                 source_id=source_id,
#                 source_type=SourceType.TOPIC,
#                 user_id=user_id,
#                 notebook_id=notebook_id,
#                 topic=topic,
#             )
#         )

#         return SourceUploadResponse(
#             id=source.id,
#             source_id=source_id,
#             title=source.title,
#             source_type=SourceType.TOPIC,
#             status=SourceStatus.PROCESSING,
#             message="Topic research started. Indexing in background.",
#         )

#     # ---- Note source ----
#     async def create_note_source(
#         self, note_data: NoteCreateRequest, user_id: uuid.UUID
#     ) -> SourceUploadResponse:
#         """Create a note (plain text) and index it."""
#         await self.notebook_service.get_notebook(note_data.notebook_id, user_id)

#         # source_id from text hash
#         source_id = hashlib.md5(note_data.text.encode()).hexdigest()
#         existing = await self.source_repo.get_by_source_id(source_id, user_id)
#         if existing:
#             return SourceUploadResponse(
#                 id=existing.id, source_id=source_id, title=existing.title,
#                 source_type=SourceType.NOTE, status=existing.status,
#                 message="Note already exists.",
#             )

#         word_count = len(note_data.text.split())
#         char_count = len(note_data.text)
#         source_data = {
#             "text": note_data.text,
#             "word_count": word_count,
#             "character_count": char_count,
#             "source": note_data.source or "pasted",
#             "tags": note_data.tags,
#         }

#         source = Source(
#             notebook_id=note_data.notebook_id,
#             user_id=user_id,
#             source_id=source_id,
#             source_type=SourceType.NOTE,
#             title=note_data.title,
#             status=SourceStatus.PROCESSING,
#             source_data=source_data,
#         )
#         source = await self.source_repo.create(source)

#         asyncio.create_task(
#             index_source_background(
#                 source_id=source_id,
#                 source_type=SourceType.NOTE,
#                 user_id=user_id,
#                 notebook_id=note_data.notebook_id,
#                 text=note_data.text,
#                 title=note_data.title,
#             )
#         )

#         return SourceUploadResponse(
#             id=source.id,
#             source_id=source_id,
#             title=source.title,
#             source_type=SourceType.NOTE,
#             status=SourceStatus.PROCESSING,
#             message="Note saved. Indexing in background.",
#         )

#     # ---- Common operations ----
#     async def list_sources(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, page: int = 1, size: int = 20
#     ) -> SourceListResponse:
#         await self.notebook_service.get_notebook(notebook_id, user_id)
#         skip = (page - 1) * size
#         sources = await self.source_repo.list_by_notebook(notebook_id, user_id, skip=skip, limit=size)
#         total = await self.source_repo.count_by_notebook(notebook_id, user_id)
#         return SourceListResponse(
#             sources=[SourceResponse.model_validate(s) for s in sources],
#             total=total, page=page, size=size,
#             has_more=(skip + size) < total,
#         )

#     async def get_source(self, source_id: str, user_id: uuid.UUID) -> Source:
#         source = await self.source_repo.get_by_source_id(source_id, user_id)
#         if not source:
#             raise NotFoundException(f"Source {source_id} not found")
#         return source

#     async def get_status(self, source_id: str, user_id: uuid.UUID) -> SourceStatusResponse:
#         source = await self.source_repo.get_by_source_id(source_id, user_id)
#         if not source:
#             raise NotFoundException(f"Source {source_id} not found")
#         return SourceStatusResponse(
#             source_id=source_id,
#             status=source.status,
#             error_message=source.error_message,
#         )  

#     # ---- Delete source ----

#     async def _cleanup_qdrant(self, source_id: str, user_id: uuid.UUID) -> int:
#         """Isolated logic for Qdrant cleanup."""
#         try:
#             client = get_qdrant_client()
#             collection = settings.QDRANT_COLLECTION
#             if not collection_exists(client, collection):
#                 return 0
                
#             filt = Filter(must=[
#                 FieldCondition(key='source_id', match=MatchValue(value=source_id)),
#                 FieldCondition(key='user_id', match=MatchValue(value=str(user_id))),
#             ])
            
#             count = client.count(collection_name=collection, count_filter=filt).count
#             if count > 0:
#                 client.delete(collection_name=collection, points_selector=filt)
#             return count
#         except Exception as e:
#             logger.error(f"Qdrant cleanup error for source {source_id}: {e}")
#             return 0
    
#     async def _cleanup_storage(self, file_id: str) -> bool:
#         """Isolated logic for storage cleanup."""
#         try:
#             return self.storage.delete_file(file_id)
#         except Exception as e:
#             logger.error(f"Storage cleanup error for source {file_id}: {e}")
#             return False


#     async def delete_source(self, source_id: str, user_id: uuid.UUID) -> SourceDeleteResponse:
#         source = await self.source_repo.get_by_source_id(source_id, user_id)
#         if not source:
#             raise NotFoundException(f"Source {source_id} not found")

#         tasks = [self._cleanup_qdrant(source_id, user_id)]
#         if source.source_type == SourceType.UPLOAD and source.source_data['imagekit_file_id']:
#             tasks.append(self._cleanup_storage(source.source_data['imagekit_file_id']))
        
#         results = await asyncio.gather(*tasks, return_exceptions=True)
#         chunks_deleted = results[0] if not isinstance(results[0], Exception) else 0
#         imagekit_failed = False
#         if source.source_type == SourceType.UPLOAD and isinstance(results[1], Exception):
#             imagekit_failed = True        

#         await self.source_repo.delete(source)
        
#         message = "Source deleted successfully"
#         if imagekit_failed:
#             message += " (storage deletion failed, manual cleanup may be required)"

#         logger.info(f"Source deleted: {source_id}")
        
#         return SourceDeleteResponse(
#             message=message,
#             source_id=source_id, chunks_deleted=chunks_deleted,
#         )










"""Source service — supports upload, website, YouTube, topic, note."""

from app.features.sources.tasks import index_source_background
import uuid
import hashlib
import tempfile
import aiofiles  
import os
from typing import List, Optional
from datetime import datetime

import asyncio
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from qdrant_client.models import PointStruct, VectorParams, Distance, Filter, FieldCondition, MatchValue, PayloadSchemaType

from app.core.config import settings
from app.core.ai_clients import get_qdrant_client, get_embeddings, get_vector_size
from app.core.logger import logger
from app.core.exceptions import NotFoundException, ValidationError
from app.core.providers.storage import get_storage_provider

from app.features.notebooks.service import NotebookService
from app.features.sources.repository import SourceRepository
from app.features.sources.model import Source, SourceType, SourceStatus
from app.features.sources.schema import (
    SourceUploadResponse, SourceListResponse, SourceResponse,
    SourceDeleteResponse, SourceStatusResponse, NoteCreateRequest,
)
from app.features.sources.loader import load_file, is_supported
from app.features.sources.chunker import generate_markdown, smart_chunk
from app.features.sources.helpers import ensure_collection, collection_exists

from app.database.session import AsyncSessionLocal

class SourceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.source_repo = SourceRepository(db)
        self.notebook_service = NotebookService(db)
        self.storage = get_storage_provider()

    # ---- Upload source ----
    async def create_upload_source(
        self, file: UploadFile, notebook_id: uuid.UUID, user_id: uuid.UUID
    ) -> SourceUploadResponse:
        await self.notebook_service.get_notebook(notebook_id, user_id)

        file_name = file.filename or "unknown"
        if not is_supported(file_name):
            raise ValidationError(f"Unsupported file type: {file_name}")

        # ── 1. Create a SINGLE temp file (streaming) ──────────────────────────
        ext = os.path.splitext(file_name)[1]
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        temp_path = temp_file.name

        try:
            # Stream the uploaded file to disk asynchronously
            async with aiofiles.open(temp_path, 'wb') as out_file:
                while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                    await out_file.write(chunk)
        except Exception as e:
            os.unlink(temp_path)  # Clean up if streaming fails
            raise ValidationError(f"Failed to save uploaded file: {e}")

        # ── 2. Compute hash from the temp file (avoid reading into memory) ────
        hasher = hashlib.md5()
        async with aiofiles.open(temp_path, 'rb') as f:
            while chunk := await f.read(8192):
                hasher.update(chunk)
        source_id = hasher.hexdigest()

        # ── 3. Duplicate check ──────────────────────────────────────────────────
        existing = await self.source_repo.get_by_source_id(source_id, user_id)
        if existing:
            os.unlink(temp_path)  # Delete temp file, no need to keep it
            return SourceUploadResponse(
                id=existing.id, source_id=source_id, title=existing.title,
                source_type=existing.source_type, status=existing.status,
                message="Source already uploaded.",
            )

        # ── 4. Upload to ImageKit (using the temp file path) ──────────────────
        try:
            upload_result = self.storage.upload_file(
                temp_path,  # Pass the path directly
                file_name,
                folder=f"sources/{notebook_id}"
            )
        except Exception as e:
            os.unlink(temp_path)  # Clean up if ImageKit fails
            logger.error(f"ImageKit upload failed: {e}")
            raise ValidationError(f"Failed to store file: {e}")

        # ── 5. Save to DB ──────────────────────────────────────────────────────
        file_size = os.path.getsize(temp_path)
        file_type = ext.lstrip('.')
        source_data = {
            "file_name": file_name,
            "file_type": file_type,
            "file_size_bytes": file_size,
            "imagekit_file_id": upload_result.get("file_id"),
            "imagekit_url": upload_result.get("url"),
            "thumbnail_url": upload_result.get("thumbnail_url")
        }

        source = Source(
            notebook_id=notebook_id,
            user_id=user_id,
            source_id=source_id,
            source_type=SourceType.UPLOAD,
            title=file_name,
            status=SourceStatus.PROCESSING,
            source_data=source_data,
        )
        source = await self.source_repo.create(source)

        # ── 6. Spawn background task & pass the temp file path ────────────────
        asyncio.create_task(
            index_source_background(
                source_id=source_id,
                source_type=SourceType.UPLOAD,
                user_id=user_id,
                notebook_id=notebook_id,
                file_path=temp_path,          # Pass the path, not the bytes!
                file_name=file_name,
            )
        )

        # ⚠️ IMPORTANT: Do NOT delete temp_path here. The background task owns it now.

        return SourceUploadResponse(
            id=source.id,
            source_id=source_id,
            title=source.title,
            source_type=SourceType.UPLOAD,
            status=SourceStatus.PROCESSING,
            message="Source uploaded. Indexing in background.",
        )


    # ---- Website source ----
    async def create_website_source(
        self, url: str, notebook_id: uuid.UUID, user_id: uuid.UUID, title: Optional[str] = None
    ) -> SourceUploadResponse:
        """Fetch and index a website."""
        await self.notebook_service.get_notebook(notebook_id, user_id)

        # Generate source_id from URL
        source_id = hashlib.md5(url.encode()).hexdigest()
        existing = await self.source_repo.get_by_source_id(source_id, user_id)
        if existing:
            return SourceUploadResponse(
                id=existing.id, source_id=source_id, title=existing.title,
                source_type=SourceType.WEBSITE, status=existing.status,
                message="Website already added.",
            )

        source_data = {
            "url": url,
            "title": title or url,
            "content": "",
            "word_count": 0,
        }

        source = Source(
            notebook_id=notebook_id,
            user_id=user_id,
            source_id=source_id,
            source_type=SourceType.WEBSITE,
            title=title or url,
            status=SourceStatus.PROCESSING,
            source_data=source_data,
        )
        source = await self.source_repo.create(source)

        # Background indexing
        asyncio.create_task(
            index_source_background(
                source_id=source_id,
                source_type=SourceType.WEBSITE,
                user_id=user_id,
                notebook_id=notebook_id,
                url=url,
            )
        )

        return SourceUploadResponse(
            id=source.id,
            source_id=source_id,
            title=source.title,
            source_type=SourceType.WEBSITE,
            status=SourceStatus.PROCESSING,
            message="Website added. Indexing in background.",
        )

    # ---- YouTube source ----
    async def create_youtube_source(
        self, url: str, notebook_id: uuid.UUID, user_id: uuid.UUID, title: Optional[str] = None
    ) -> SourceUploadResponse:
        """Fetch and index a YouTube video transcript."""
        await self.notebook_service.get_notebook(notebook_id, user_id)

        # Extract video ID (simplified)
        video_id = url.split("v=")[-1].split("&")[0] if "v=" in url else url
        source_id = hashlib.md5(video_id.encode()).hexdigest()
        existing = await self.source_repo.get_by_source_id(source_id, user_id)
        if existing:
            return SourceUploadResponse(
                id=existing.id, source_id=source_id, title=existing.title,
                source_type=SourceType.YOUTUBE, status=existing.status,
                message="YouTube video already added.",
            )

        source_data = {
            "url": url,
            "video_id": video_id,
            "thumbnail_url": None,
            "language": "en",
            "content": "",  # Will be filled in background
        }

        source = Source(
            notebook_id=notebook_id,
            user_id=user_id,
            source_id=source_id,
            source_type=SourceType.YOUTUBE,
            title=title or f"YouTube: {video_id}",
            status=SourceStatus.PROCESSING,
            source_data=source_data,
        )
        source = await self.source_repo.create(source)

        asyncio.create_task(
            index_source_background(
                source_id=source_id,
                source_type=SourceType.YOUTUBE,
                user_id=user_id,
                notebook_id=notebook_id,
                url=url,
            )
        )

        return SourceUploadResponse(
            id=source.id,
            source_id=source_id,
            title=source.title,
            source_type=SourceType.YOUTUBE,
            status=SourceStatus.PROCESSING,
            message="YouTube video added. Indexing in background.",
        )

    # ---- Topic source ----
    async def create_topic_source(
        self, topic: str, notebook_id: uuid.UUID, user_id: uuid.UUID
    ) -> SourceUploadResponse:
        """Generate a research document on a topic using LLM."""
        await self.notebook_service.get_notebook(notebook_id, user_id)

        source_id = hashlib.md5(topic.encode()).hexdigest()
        existing = await self.source_repo.get_by_source_id(source_id, user_id)
        if existing:
            return SourceUploadResponse(
                id=existing.id, source_id=source_id, title=existing.title,
                source_type=SourceType.TOPIC, status=existing.status,
                message="Topic already added.",
            )

        source_data = {
            "topic": topic,
            "content": "",  # Will be filled in background
            "source_urls": [],
        }

        source = Source(
            notebook_id=notebook_id,
            user_id=user_id,
            source_id=source_id,
            source_type=SourceType.TOPIC,
            title=topic,
            status=SourceStatus.PROCESSING,
            source_data=source_data,
        )
        source = await self.source_repo.create(source)

        asyncio.create_task(
            index_source_background(
                source_id=source_id,
                source_type=SourceType.TOPIC,
                user_id=user_id,
                notebook_id=notebook_id,
                topic=topic,
            )
        )

        return SourceUploadResponse(
            id=source.id,
            source_id=source_id,
            title=source.title,
            source_type=SourceType.TOPIC,
            status=SourceStatus.PROCESSING,
            message="Topic research started. Indexing in background.",
        )

    # ---- Note source ----
    async def create_note_source(
        self, note_data: NoteCreateRequest, user_id: uuid.UUID
    ) -> SourceUploadResponse:
        """Create a note (plain text) and index it."""
        await self.notebook_service.get_notebook(note_data.notebook_id, user_id)

        # source_id from text hash
        source_id = hashlib.md5(note_data.content.encode()).hexdigest()
        existing = await self.source_repo.get_by_source_id(source_id, user_id)
        if existing:
            return SourceUploadResponse(
                id=existing.id, source_id=source_id, title=existing.title,
                source_type=SourceType.NOTE, status=existing.status,
                message="Note already exists.",
            )

        source_data = {
            "content": note_data.content,
        }

        source = Source(
            notebook_id=note_data.notebook_id,
            user_id=user_id,
            source_id=source_id,
            source_type=SourceType.NOTE,
            title=note_data.title,
            status=SourceStatus.PROCESSING,
            source_data=source_data,
        )
        source = await self.source_repo.create(source)

        asyncio.create_task(
            index_source_background(
                source_id=source_id,
                source_type=SourceType.NOTE,
                user_id=user_id,
                notebook_id=note_data.notebook_id,
                text=note_data.content,
                title=note_data.title,
            )
        )

        return SourceUploadResponse(
            id=source.id,
            source_id=source_id,
            title=source.title,
            source_type=SourceType.NOTE,
            status=SourceStatus.PROCESSING,
            message="Note saved. Indexing in background.",
        )

    # ---- Common operations ----
    async def list_sources(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, page: int = 1, size: int = 20
    ) -> SourceListResponse:
        await self.notebook_service.get_notebook(notebook_id, user_id)
        skip = (page - 1) * size
        sources = await self.source_repo.list_by_notebook(notebook_id, user_id, skip=skip, limit=size)
        total = await self.source_repo.count_by_notebook(notebook_id, user_id)
        return SourceListResponse(
            sources=[SourceResponse.model_validate(s) for s in sources],
            total=total, page=page, size=size,
            has_more=(skip + size) < total,
        )

    async def get_source(self, source_id: str, user_id: uuid.UUID) -> Source:
        source = await self.source_repo.get_by_source_id(source_id, user_id)
        if not source:
            raise NotFoundException(f"Source {source_id} not found")
        return source

    async def get_status(self, source_id: str, user_id: uuid.UUID) -> SourceStatusResponse:
        source = await self.source_repo.get_by_source_id(source_id, user_id)
        if not source:
            raise NotFoundException(f"Source {source_id} not found")
        return SourceStatusResponse(
            source_id=source_id,
            status=source.status,
            error_message=source.error_message,
            total_chunks=source.total_chunks,  # ADDED
        )  

    # ---- Delete source ----

    async def _cleanup_qdrant(self, source_id: str, user_id: uuid.UUID) -> int:
        """Isolated logic for Qdrant cleanup."""
        try:
            client = get_qdrant_client()
            collection = settings.QDRANT_COLLECTION
            if not collection_exists(client, collection):
                return 0
                
            filt = Filter(must=[
                FieldCondition(key='source_id', match=MatchValue(value=source_id)),
                FieldCondition(key='user_id', match=MatchValue(value=str(user_id))),
            ])
            
            count = client.count(collection_name=collection, count_filter=filt).count
            if count > 0:
                client.delete(collection_name=collection, points_selector=filt)
            return count
        except Exception as e:
            logger.error(f"Qdrant cleanup error for source {source_id}: {e}")
            return 0
    
    async def _cleanup_storage(self, file_id: str) -> bool:
        """Isolated logic for storage cleanup."""
        try:
            return self.storage.delete_file(file_id)
        except Exception as e:
            logger.error(f"Storage cleanup error for source {file_id}: {e}")
            return False


    async def delete_source(self, source_id: str, user_id: uuid.UUID) -> SourceDeleteResponse:
        source = await self.source_repo.get_by_source_id(source_id, user_id)
        if not source:
            raise NotFoundException(f"Source {source_id} not found")

        tasks = [self._cleanup_qdrant(source_id, user_id)]
        if source.source_type == SourceType.UPLOAD and source.source_data.get('imagekit_file_id'):
            tasks.append(self._cleanup_storage(source.source_data['imagekit_file_id']))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        chunks_deleted = results[0] if not isinstance(results[0], Exception) else 0
        imagekit_failed = False
        if source.source_type == SourceType.UPLOAD and isinstance(results[1], Exception):
            imagekit_failed = True        

        await self.source_repo.delete(source)
        
        message = "Source deleted successfully"
        if imagekit_failed:
            message += " (storage deletion failed, manual cleanup may be required)"

        logger.info(f"Source deleted: {source_id}")
        
        return SourceDeleteResponse(
            message=message,
            source_id=source_id,
        )