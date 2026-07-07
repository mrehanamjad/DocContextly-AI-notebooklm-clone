# """Artifact service — orchestrates source resolution, context building, compression, generation, and persistence."""

# import uuid
# from typing import Any, Optional, List
# from fastapi.background import BackgroundTasks
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.core.logger import logger
# from app.core.exceptions import NotFoundException, BadRequestException
# from app.core.providers.storage import get_storage_provider

# from app.features.notebooks.service import NotebookService
# from app.features.sources.repository import SourceRepository
# from app.features.artifacts.repository import ArtifactRepository
# from app.features.artifacts.model import Artifact
# from app.features.artifacts.tasks import run_generation_task
# from app.features.artifacts.schema import (
#     ArtifactType,
#     ArtifactStatus,
#     BaseArtifactRequest,
#     QuizCreateRequest,
#     FlashcardCreateRequest,
#     FAQCreateRequest,
#     StudyGuideCreateRequest,
#     SummaryCreateRequest,
#     MindMapCreateRequest,
#     SlideDeckCreateRequest,
#     AudioOverviewCreateRequest,
#     ReportCreateRequest,
#     DataTableCreateRequest,
#     SourceFilterInfo,
#     ArtifactResponse,
#     ArtifactListResponse,
# )


# class ArtifactService:
#     def __init__(self, db: AsyncSession):
#         self.db = db
#         self.artifact_repo = ArtifactRepository(db)
#         self.notebook_service = NotebookService(db)
#         self.source_repo = SourceRepository(db)

#     # ── Source Resolution ─────────────────────────────────────────────────────────

#     async def _resolve_source_ids(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, excluded_source_ids: List[str]
#     ) -> tuple[List[str], SourceFilterInfo]:
#         """Resolve active source IDs for artifact generation."""
#         all_source_ids = await self.source_repo.get_source_ids_for_notebook(notebook_id, user_id)

#         if not all_source_ids:
#             raise NotFoundException("No sources available for this notebook")

#         excluded_set = set(excluded_source_ids)
#         resolved = [sid for sid in all_source_ids if sid not in excluded_set]

#         if not resolved:
#             raise BadRequestException("No sources selected for artifact generation")

#         filter_info = SourceFilterInfo(
#             excluded_source_ids=list(excluded_set),
#             resolved_source_ids=resolved,
#         )

#         return resolved, filter_info

#     # ── Core Generation Pipeline ──────────────────────────────────────────────────

#     async def _create_processing_artifact(
#         self,
#         notebook_id: uuid.UUID,
#         user_id: uuid.UUID,
#         artifact_type: ArtifactType,
#         request: BaseArtifactRequest,
#         options: dict[str, Any],
#         background_tasks: BackgroundTasks,
#     ) -> Artifact:
#         """Phase 1: Validate, resolve sources, save PROCESSING state, and enqueue task."""
        
#         # 1. Validate notebook ownership synchronously (fail-fast)
#         await self.notebook_service.get_notebook(notebook_id, user_id)

#         # 2. Resolve source scope synchronously (fail-fast if invalid sources)
#         resolved_ids, filter_info = await self._resolve_source_ids(
#             notebook_id, user_id, request.excluded_source_ids
#         )

#         # 3. Create placeholder artifact
#         artifact = Artifact(
#             notebook_id=notebook_id,
#             user_id=user_id,
#             artifact_type=artifact_type,
#             status=ArtifactStatus.PROCESSING,  
#             title=f"Generating {artifact_type.value.title()}...",
#             options_json={
#                 "prompt": request.prompt,
#                 **options,
#             },
#             included_sources=resolved_ids,
#             content_json={},
#         )

#         saved_artifact = await self.artifact_repo.create(artifact)
#         logger.info(f"Artifact saved with PROCESSING status: {saved_artifact}")
        
#         # 4. Enqueue the heavy lifting to the background worker
#         background_tasks.add_task(
#             run_generation_task,
#             artifact_id=saved_artifact.id,
#             notebook_id=notebook_id,
#             user_id=user_id,
#             artifact_type=artifact_type,
#             request_prompt=request.prompt,
#             options=options,
#             resolved_ids=resolved_ids
#         )

#         return saved_artifact

#     # ── Public API Methods ────────────────────────────────────────────────────────

#     async def create_quiz(
#         self, 
#         notebook_id: uuid.UUID, 
#         user_id: uuid.UUID, 
#         request: QuizCreateRequest,
#         background_tasks: BackgroundTasks,
#     ) -> Artifact:

#         q_nos =  int(request.number_of_questions)
#         if q_nos > 20:
#             raise BadRequestException("Number of questions must be less than 20")
#         if q_nos < 1:
#             raise BadRequestException("Number of questions must be greater than 1")

#         options = {
#             "question_count": q_nos,
#             "difficulty": request.difficulty.value,
#         }
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.QUIZ, request, options, background_tasks
#         )

#     async def create_flashcards(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: FlashcardCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {"card_count": request.number_of_cards}
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.FLASHCARDS, request, options, background_tasks
#         )

#     async def create_faqs(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: FAQCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {"faq_count": request.number_of_faqs}
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.FAQ, request, options, background_tasks
#         )

#     async def create_study_guide(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: StudyGuideCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {"size": request.size.value}
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.STUDY_GUIDE, request, options, background_tasks
#         )

#     async def create_summary(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: SummaryCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.SUMMARY, request, {}, background_tasks
#         )

#     async def create_mindmap(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: MindMapCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.MINDMAP, request, {}, background_tasks
#         )

#     async def create_slide_deck(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: SlideDeckCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {"length": request.length}
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.SLIDE_DECK, request, options, background_tasks
#         )

#     async def create_voice_overview(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: AudioOverviewCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {
#             "length": request.length.value,
#             "voice_style": request.voice_style.value,
#             "host_names": request.host_names or ["Alex", "Jordan"],
#         }
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.VOICE_OVERVIEW, request, options, background_tasks
#         )

#     async def create_report(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: ReportCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {"length": request.length.value}
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.REPORT, request, options, background_tasks
#         )

#     async def create_datatable(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: DataTableCreateRequest, background_tasks: BackgroundTasks
#     ) -> Artifact:
#         options = {"max_rows": request.max_rows}
#         return await self._create_processing_artifact(
#             notebook_id, user_id, ArtifactType.DATATABLE, request, options, background_tasks
#         )
    
#     async def retry_artifact_generation(
#         self,
#         notebook_id: uuid.UUID,
#         artifact_id: uuid.UUID,
#         user_id: uuid.UUID,
#         background_tasks: BackgroundTasks,
#     ) -> Artifact:
#         """Retry a failed artifact generation."""
#         # 1. Fetch the artifact
#         artifact = await self.get_artifact(notebook_id, artifact_id, user_id)
        
#         if artifact.status != ArtifactStatus.ERROR:
#             raise BadRequestException("Only failed artifacts can be retried.")

#         # 2. Reset status
#         artifact.status = ArtifactStatus.PROCESSING
#         artifact.error_message = None
#         await self.artifact_repo.update(artifact)
        
#         # 3. Re-enqueue the same generation task
#         background_tasks.add_task(
#             run_generation_task,
#             artifact_id=artifact.id,
#             notebook_id=notebook_id,
#             user_id=user_id,
#             artifact_type=artifact.artifact_type,
#             request_prompt=artifact.options_json.get("prompt"),
#             options=artifact.options_json,
#             resolved_ids=artifact.included_sources
#         )

#         resuming_from_cache = bool(artifact.evidence_pack_json)
#         logger.info(
#             f"Retrying generation for artifact {artifact_id} "
#             f"({'resuming from cached evidence pack' if resuming_from_cache else 'starting from scratch'})"
#         )
#         return artifact

#     # ── Read / Delete ─────────────────────────────────────────────────────────────

#     async def list_artifacts(
#         self,
#         notebook_id: uuid.UUID,
#         user_id: uuid.UUID,
#         artifact_type: Optional[ArtifactType] = None,
#         status_filter: Optional[ArtifactStatus] = None,
#         size: int = 20,
#         page: int = 1,
#     ) -> ArtifactListResponse:
#         """List artifacts for a notebook with optional filters."""
#         await self.notebook_service.get_notebook(notebook_id, user_id)
#         offset = (page - 1) * size
        
#         # This now returns List[ArtifactShortResponse]
#         artifacts, total = await self.artifact_repo.list_by_notebook(
#             notebook_id, 
#             user_id, 
#             artifact_type=artifact_type, 
#             status=status_filter, 
#             limit=size, 
#             offset=offset
#         )
        
#         # Return with short responses - no need to validate again
#         return ArtifactListResponse(
#             artifacts=artifacts,  # Already ArtifactShortResponse objects
#             total=total,
#             size=size,
#             page=page,
#             has_more=(offset + size) < total,
#         )


#     async def get_artifact(
#         self, notebook_id: uuid.UUID, artifact_id: uuid.UUID, user_id: uuid.UUID
#     ) -> Artifact:
#         """Get a specific artifact by ID."""
#         await self.notebook_service.get_notebook(notebook_id, user_id)
#         artifact = await self.artifact_repo.get_by_id(artifact_id, notebook_id, user_id)
#         if not artifact:
#             raise NotFoundException(f"Artifact {artifact_id} not found")
#         return artifact

#     async def delete_artifact(
#         self, notebook_id: uuid.UUID, artifact_id: uuid.UUID, user_id: uuid.UUID
#     ) -> None:
#         """Delete a single artifact, cleaning up its ImageKit audio file first if applicable."""
#         artifact = await self.get_artifact(notebook_id, artifact_id, user_id)

#         file_id = self._extract_audio_file_id(artifact)
#         if file_id:
#             self._delete_audio_file(file_id, artifact.id)

#         await self.artifact_repo.delete(artifact)
#         logger.info(f"Artifact deleted: id={artifact_id}, notebook={notebook_id}")

#     async def delete_all_artifacts(
#         self, notebook_id: uuid.UUID, user_id: uuid.UUID
#     ) -> None:
#         """Delete all artifacts for a notebook.

#         Storage cleanup strategy:
#         - Collects all audio_file_ids from every VOICE_OVERVIEW artifact first.
#         - If there is more than one, issues a single bulk delete_many_files call
#           instead of N individual deletes.
#         - If there is exactly one, uses the regular delete_file call.
#         - DB rows are deleted regardless of whether storage cleanup succeeded
#           (storage is best-effort; we never block DB cleanup on a storage error).
#         """
#         await self.notebook_service.get_notebook(notebook_id, user_id)

#         # Collect all audio file IDs from VOICE_OVERVIEW artifacts in one query.
#         audio_artifacts = await self.artifact_repo.list_by_notebook(
#             notebook_id, user_id, artifact_type=ArtifactType.VOICE_OVERVIEW
#         )

#         file_ids: list[str] = [
#             fid
#             for a in audio_artifacts
#             if (fid := self._extract_audio_file_id(a))
#         ]

#         if file_ids:
#             try:
#                 storage = get_storage_provider()
#                 if len(file_ids) == 1:
#                     storage.delete_file(file_ids[0])
#                     logger.info(f"Storage: deleted 1 voice-overview file for notebook={notebook_id}")
#                 else:
#                     storage.delete_many_files(file_ids)
#                     logger.info(
#                         f"Storage: bulk-deleted {len(file_ids)} voice-overview files "
#                         f"for notebook={notebook_id}"
#                     )
#             except Exception as e:
#                 # Best-effort — log and continue so DB rows are still cleaned up.
#                 logger.warning(
#                     f"Storage cleanup failed for notebook={notebook_id} "
#                     f"({len(file_ids)} file(s)); proceeding with DB delete. Error: {e}"
#                 )

#         count = await self.artifact_repo.delete_by_notebook(notebook_id, user_id)
#         logger.info(f"Deleted {count} artifact rows for notebook={notebook_id}")

#     # ── Storage helpers ────────────────────────────────────────────────────────

#     @staticmethod
#     def _extract_audio_file_id(artifact: Artifact) -> str | None:
#         """
#         Return the ImageKit file_id for a VOICE_OVERVIEW artifact, or None.

#         The file_id lives at content_json["audio"]["audio_file_id"] — there is
#         no dedicated DB column for it.  Returns None for non-audio artifact types
#         and for audio artifacts whose file has not been uploaded yet (e.g. still
#         PROCESSING or ERROR before upload step).
#         """
#         if artifact.artifact_type != ArtifactType.VOICE_OVERVIEW:
#             return None
#         return ((artifact.content_json or {}).get("audio") or {}).get("audio_file_id")

#     @staticmethod
#     def _delete_audio_file(file_id: str, artifact_id: uuid.UUID) -> None:
#         """Best-effort single-file deletion from storage. Never raises."""
#         try:
#             storage = get_storage_provider()
#             storage.delete_file(file_id)
#         except Exception as e:
#             logger.warning(
#                 f"Storage: failed to delete audio file for artifact {artifact_id} "
#                 f"(file_id={file_id}): {e}"
#             )



"""Artifact service — orchestrates source resolution, context building, compression, generation, and persistence."""

import uuid
from typing import Any, Optional, List
from fastapi.background import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.providers.storage import get_storage_provider
from app.core.queue.config import get_arq_pool

from app.features.notebooks.service import NotebookService
from app.features.sources.repository import SourceRepository
from app.features.artifacts.repository import ArtifactRepository
from app.features.artifacts.model import Artifact
from app.features.artifacts.tasks import run_generation_task
from app.features.artifacts.schema import (
    ArtifactType,
    ArtifactStatus,
    BaseArtifactRequest,
    QuizCreateRequest,
    FlashcardCreateRequest,
    FAQCreateRequest,
    StudyGuideCreateRequest,
    SummaryCreateRequest,
    MindMapCreateRequest,
    SlideDeckCreateRequest,
    AudioOverviewCreateRequest,
    ReportCreateRequest,
    DataTableCreateRequest,
    SourceFilterInfo,
    ArtifactResponse,
    ArtifactListResponse,
)


class ArtifactService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.artifact_repo = ArtifactRepository(db)
        self.notebook_service = NotebookService(db)
        self.source_repo = SourceRepository(db)

    # ── Source Resolution ─────────────────────────────────────────────────────────

    async def _resolve_source_ids(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, excluded_source_ids: List[str]
    ) -> tuple[List[str], SourceFilterInfo]:
        """Resolve active source IDs for artifact generation."""
        all_source_ids = await self.source_repo.get_source_ids_for_notebook(notebook_id, user_id)

        if not all_source_ids:
            raise NotFoundException("No sources available for this notebook")

        excluded_set = set(excluded_source_ids)
        resolved = [sid for sid in all_source_ids if sid not in excluded_set]

        if not resolved:
            raise BadRequestException("No sources selected for artifact generation")

        filter_info = SourceFilterInfo(
            excluded_source_ids=list(excluded_set),
            resolved_source_ids=resolved,
        )

        return resolved, filter_info

    # ── Core Generation Pipeline ──────────────────────────────────────────────────

    async def _prepare_artifact(
        self,
        notebook_id: uuid.UUID,
        user_id: uuid.UUID,
        artifact_type: ArtifactType,
        request: BaseArtifactRequest,
        options: dict[str, Any],
    ) -> tuple[Artifact, list[str]]:
        """Validate, resolve sources, and create a PROCESSING artifact record.

        Returns the saved artifact and the resolved source IDs so the caller
        can dispatch the job via ARQ or BackgroundTasks as appropriate.
        """
        # 1. Validate notebook ownership synchronously (fail-fast)
        await self.notebook_service.get_notebook(notebook_id, user_id)

        # 2. Resolve source scope synchronously (fail-fast if invalid sources)
        resolved_ids, filter_info = await self._resolve_source_ids(
            notebook_id, user_id, request.excluded_source_ids
        )

        # 3. Create placeholder artifact
        artifact = Artifact(
            notebook_id=notebook_id,
            user_id=user_id,
            artifact_type=artifact_type,
            status=ArtifactStatus.PROCESSING,  
            title=f"Generating {artifact_type.value.title()}...",
            options_json={
                "prompt": request.prompt,
                **options,
            },
            included_sources=resolved_ids,
            content_json={},
        )

        saved_artifact = await self.artifact_repo.create(artifact)
        logger.info(f"Artifact saved with PROCESSING status: {saved_artifact}")

        return saved_artifact, resolved_ids

    async def _enqueue_text_artifact(
        self,
        artifact: Artifact,
        notebook_id: uuid.UUID,
        user_id: uuid.UUID,
        artifact_type: ArtifactType,
        request_prompt: str | None,
        options: dict[str, Any],
        resolved_ids: list[str],
    ) -> None:
        """Enqueue a text artifact generation job via ARQ.

        All values are serialised to strings/dicts before being sent to Redis.
        """
        pool = get_arq_pool()
        await pool.enqueue_job(
            "generate_text_artifact",
            _job_id=f"generate_text_artifact_{artifact.id}",
            _job_timeout=900,
            artifact_id=str(artifact.id),
            notebook_id=str(notebook_id),
            user_id=str(user_id),
            artifact_type=artifact_type.value,
            request_prompt=request_prompt,
            options=options,
            resolved_ids=resolved_ids,
        )
        logger.info(f"ARQ job enqueued for artifact {artifact.id} (type={artifact_type.value})")

    async def _enqueue_voice_overview(
        self,
        artifact: Artifact,
        notebook_id: uuid.UUID,
        user_id: uuid.UUID,
        request_prompt: str | None,
        options: dict[str, Any],
        resolved_ids: list[str],
    ) -> None:
        """Enqueue a voice overview generation job via ARQ.

        All values are serialised to strings/dicts before being sent to Redis.
        """
        pool = get_arq_pool()
        await pool.enqueue_job(
            "generate_voice_overview",
            _job_id=f"generate_voice_overview_{artifact.id}",
            _job_timeout=900,
            artifact_id=str(artifact.id),
            notebook_id=str(notebook_id),
            user_id=str(user_id),
            request_prompt=request_prompt,
            options=options,
            resolved_ids=resolved_ids,
        )
        logger.info(f"ARQ job enqueued for voice overview artifact {artifact.id}")

    # ── Public API Methods ────────────────────────────────────────────────────────

    async def create_quiz(
        self, 
        notebook_id: uuid.UUID, 
        user_id: uuid.UUID, 
        request: QuizCreateRequest,
    ) -> Artifact:

        q_nos =  int(request.number_of_questions)
        if q_nos > 20:
            raise BadRequestException("Number of questions must be less than 20")
        if q_nos < 1:
            raise BadRequestException("Number of questions must be greater than 1")

        options = {
            "question_count": q_nos,
            "difficulty": request.difficulty.value,
        }
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.QUIZ, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.QUIZ, request.prompt, options, resolved_ids
        )
        return artifact

    async def create_flashcards(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: FlashcardCreateRequest,
    ) -> Artifact:
        options = {"card_count": request.number_of_cards}
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.FLASHCARDS, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.FLASHCARDS, request.prompt, options, resolved_ids
        )
        return artifact

    async def create_faqs(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: FAQCreateRequest,
    ) -> Artifact:
        options = {"faq_count": request.number_of_faqs}
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.FAQ, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.FAQ, request.prompt, options, resolved_ids
        )
        return artifact

    async def create_study_guide(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: StudyGuideCreateRequest,
    ) -> Artifact:
        options = {"size": request.size.value}
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.STUDY_GUIDE, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.STUDY_GUIDE, request.prompt, options, resolved_ids
        )
        return artifact

    async def create_summary(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: SummaryCreateRequest,
    ) -> Artifact:
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.SUMMARY, request, {}
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.SUMMARY, request.prompt, {}, resolved_ids
        )
        return artifact

    async def create_mindmap(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: MindMapCreateRequest,
    ) -> Artifact:
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.MINDMAP, request, {}
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.MINDMAP, request.prompt, {}, resolved_ids
        )
        return artifact

    async def create_slide_deck(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: SlideDeckCreateRequest,
    ) -> Artifact:
        options = {"length": request.length}
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.SLIDE_DECK, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.SLIDE_DECK, request.prompt, options, resolved_ids
        )
        return artifact

    async def create_voice_overview(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: AudioOverviewCreateRequest,
    ) -> Artifact:
        options = {
            "length": request.length.value,
            "voice_style": request.voice_style.value,
            "host_names": request.host_names or ["Alex", "Jordan"],
        }
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.VOICE_OVERVIEW, request, options
        )
        await self._enqueue_voice_overview(
            artifact=artifact,
            notebook_id=notebook_id,
            user_id=user_id,
            request_prompt=request.prompt,
            options=options,
            resolved_ids=resolved_ids,
        )
        return artifact

    async def create_report(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: ReportCreateRequest,
    ) -> Artifact:
        options = {"length": request.length.value}
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.REPORT, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.REPORT, request.prompt, options, resolved_ids
        )
        return artifact

    async def create_datatable(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID, request: DataTableCreateRequest,
    ) -> Artifact:
        options = {"max_rows": request.max_rows}
        artifact, resolved_ids = await self._prepare_artifact(
            notebook_id, user_id, ArtifactType.DATATABLE, request, options
        )
        await self._enqueue_text_artifact(
            artifact, notebook_id, user_id, ArtifactType.DATATABLE, request.prompt, options, resolved_ids
        )
        return artifact
    
    async def retry_artifact_generation(
        self,
        notebook_id: uuid.UUID,
        artifact_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Artifact:
        """Retry a failed artifact generation.

        Routes text and voice artifacts through ARQ.
        """
        # 1. Fetch the artifact
        artifact = await self.get_artifact(notebook_id, artifact_id, user_id)
        
        if artifact.status != ArtifactStatus.ERROR:
            raise BadRequestException("Only failed artifacts can be retried.")

        # 2. Reset status
        artifact.status = ArtifactStatus.PROCESSING
        artifact.error_message = None
        await self.artifact_repo.update(artifact)
        
        # 3. Re-enqueue — ARQ for both text and voice artifacts
        if artifact.artifact_type == ArtifactType.VOICE_OVERVIEW:
            await self._enqueue_voice_overview(
                artifact=artifact,
                notebook_id=notebook_id,
                user_id=user_id,
                request_prompt=artifact.options_json.get("prompt"),
                options=artifact.options_json,
                resolved_ids=artifact.included_sources,
            )
        else:
            await self._enqueue_text_artifact(
                artifact=artifact,
                notebook_id=notebook_id,
                user_id=user_id,
                artifact_type=artifact.artifact_type,
                request_prompt=artifact.options_json.get("prompt"),
                options=artifact.options_json,
                resolved_ids=artifact.included_sources,
            )

        resuming_from_cache = bool(artifact.evidence_pack_json)
        logger.info(
            f"Retrying generation for artifact {artifact_id} "
            f"({'resuming from cached evidence pack' if resuming_from_cache else 'starting from scratch'})"
        )
        return artifact

    # ── Read / Delete ─────────────────────────────────────────────────────────────

    async def list_artifacts(
        self,
        notebook_id: uuid.UUID,
        user_id: uuid.UUID,
        artifact_type: Optional[ArtifactType] = None,
        status_filter: Optional[ArtifactStatus] = None,
        size: int = 20,
        page: int = 1,
    ) -> ArtifactListResponse:
        """List artifacts for a notebook with optional filters."""
        await self.notebook_service.get_notebook(notebook_id, user_id)
        offset = (page - 1) * size
        
        # This now returns List[ArtifactShortResponse]
        artifacts, total = await self.artifact_repo.list_by_notebook(
            notebook_id, 
            user_id, 
            artifact_type=artifact_type, 
            status=status_filter, 
            limit=size, 
            offset=offset
        )
        
        # Return with short responses - no need to validate again
        return ArtifactListResponse(
            artifacts=artifacts,  # Already ArtifactShortResponse objects
            total=total,
            size=size,
            page=page,
            has_more=(offset + size) < total,
        )


    async def get_artifact(
        self, notebook_id: uuid.UUID, artifact_id: uuid.UUID, user_id: uuid.UUID
    ) -> Artifact:
        """Get a specific artifact by ID."""
        await self.notebook_service.get_notebook(notebook_id, user_id)
        artifact = await self.artifact_repo.get_by_id(artifact_id, notebook_id, user_id)
        if not artifact:
            raise NotFoundException(f"Artifact {artifact_id} not found")
        return artifact

    async def delete_artifact(
        self, notebook_id: uuid.UUID, artifact_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        """Delete a single artifact, cleaning up its ImageKit audio file first if applicable."""
        artifact = await self.get_artifact(notebook_id, artifact_id, user_id)

        file_id = self._extract_audio_file_id(artifact)
        if file_id:
            self._delete_audio_file(file_id, artifact.id)

        await self.artifact_repo.delete(artifact)
        logger.info(f"Artifact deleted: id={artifact_id}, notebook={notebook_id}")

    async def delete_all_artifacts(
        self, notebook_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        """Delete all artifacts for a notebook.

        Storage cleanup strategy:
        - Collects all audio_file_ids from every VOICE_OVERVIEW artifact first.
        - If there is more than one, issues a single bulk delete_many_files call
          instead of N individual deletes.
        - If there is exactly one, uses the regular delete_file call.
        - DB rows are deleted regardless of whether storage cleanup succeeded
          (storage is best-effort; we never block DB cleanup on a storage error).
        """
        await self.notebook_service.get_notebook(notebook_id, user_id)

        # Collect all audio file IDs from VOICE_OVERVIEW artifacts in one query.
        #
        # NOTE: list_by_notebook() returns a (List[ArtifactShortResponse], int)
        # tuple of *short* responses that don't carry content_json, so it can't
        # be used here — iterating it directly used to crash (it iterated the
        # 2-item tuple itself), and even unpacked it wouldn't expose the
        # audio_file_id nested in content_json. get_artifacts_by_type() returns
        # full Artifact rows instead, which have what _extract_audio_file_id needs.
        audio_artifacts = await self.artifact_repo.get_artifacts_by_type(
            notebook_id, user_id, ArtifactType.VOICE_OVERVIEW, limit=1000
        )

        file_ids: list[str] = [
            fid
            for a in audio_artifacts
            if (fid := self._extract_audio_file_id(a))
        ]

        if file_ids:
            try:
                storage = get_storage_provider()
                if len(file_ids) == 1:
                    storage.delete_file(file_ids[0])
                    logger.info(f"Storage: deleted 1 voice-overview file for notebook={notebook_id}")
                else:
                    storage.delete_many_files(file_ids)
                    logger.info(
                        f"Storage: bulk-deleted {len(file_ids)} voice-overview files "
                        f"for notebook={notebook_id}"
                    )
            except Exception as e:
                # Best-effort — log and continue so DB rows are still cleaned up.
                logger.warning(
                    f"Storage cleanup failed for notebook={notebook_id} "
                    f"({len(file_ids)} file(s)); proceeding with DB delete. Error: {e}"
                )

        count = await self.artifact_repo.delete_by_notebook(notebook_id, user_id)
        logger.info(f"Deleted {count} artifact rows for notebook={notebook_id}")

    # ── Storage helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _extract_audio_file_id(artifact: Artifact) -> str | None:
        """
        Return the ImageKit file_id for a VOICE_OVERVIEW artifact, or None.

        The file_id lives at content_json["audio"]["audio_file_id"] — there is
        no dedicated DB column for it.  Returns None for non-audio artifact types
        and for audio artifacts whose file has not been uploaded yet (e.g. still
        PROCESSING or ERROR before upload step).
        """
        if artifact.artifact_type != ArtifactType.VOICE_OVERVIEW:
            return None
        return ((artifact.content_json or {}).get("audio") or {}).get("audio_file_id")

    @staticmethod
    def _delete_audio_file(file_id: str, artifact_id: uuid.UUID) -> None:
        """Best-effort single-file deletion from storage. Never raises."""
        try:
            storage = get_storage_provider()
            storage.delete_file(file_id)
        except Exception as e:
            logger.warning(
                f"Storage: failed to delete audio file for artifact {artifact_id} "
                f"(file_id={file_id}): {e}"
            )