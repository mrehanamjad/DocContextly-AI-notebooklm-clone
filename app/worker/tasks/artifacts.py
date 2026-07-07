"""ARQ task wrapper for text artifact generation.

This module wraps the existing ``run_generation_task`` pipeline from
``app.features.artifacts.tasks`` as an ARQ-compatible async function.

It does NOT duplicate any business logic — it simply:
    1. Opens a scoped DB session.
    2. Sets the artifact status to PROCESSING.
    3. Delegates to the existing ``run_generation_task``.
    4. Handles transient vs fatal errors using the shared retry infra.

Voice Overview is explicitly excluded and still uses FastAPI BackgroundTasks.
"""

from __future__ import annotations

import time
import uuid
from typing import Any

from app.core.logger import logger
from app.worker.context import worker_db_session, get_worker_logger
from app.core.queue.exceptions import (
    TransientWorkerError,
    FatalWorkerError,
    handle_transient_error,
)
from app.features.artifacts.schema import ArtifactType, ArtifactStatus


async def generate_text_artifact(
    ctx: dict,
    *,
    artifact_id: str,
    notebook_id: str,
    user_id: str,
    artifact_type: str,
    request_prompt: str | None,
    options: dict[str, Any],
    resolved_ids: list[str],
) -> dict[str, str]:
    """ARQ task: generate a text-based artifact (quiz, summary, report, etc.).

    All arguments are plain serializable types (strings, dicts, lists).
    UUIDs are passed as strings and converted internally.

    Returns a small result dict that ARQ stores in Redis for observability.
    """
    # ── Structured logging prefix ─────────────────────────────────────────
    prefix = get_worker_logger(ctx, extra={
        "artifact_id": artifact_id,
        "notebook_id": notebook_id,
        "type": artifact_type,
    })
    start_time = time.monotonic()
    logger.info(f"{prefix} Starting text artifact generation")

    # ── Convert string IDs back to UUIDs ──────────────────────────────────
    _artifact_id = uuid.UUID(artifact_id)
    _notebook_id = uuid.UUID(notebook_id)
    _user_id = uuid.UUID(user_id)
    _artifact_type = ArtifactType(artifact_type)

    # ── Safety check: voice overview should NOT run through this task ─────
    if _artifact_type == ArtifactType.VOICE_OVERVIEW:
        raise FatalWorkerError(
            f"Voice overview must not be routed to generate_text_artifact. "
            f"artifact_id={artifact_id}"
        )

    try:
        # Delegate to the existing generation pipeline.
        # run_generation_task already manages its own AsyncSessionLocal,
        # its own error handling, and its own status updates.
        from app.features.artifacts.tasks import run_generation_task

        await run_generation_task(
            artifact_id=_artifact_id,
            notebook_id=_notebook_id,
            user_id=_user_id,
            artifact_type=_artifact_type,
            request_prompt=request_prompt,
            options=options,
            resolved_ids=resolved_ids,
        )

        elapsed = round(time.monotonic() - start_time, 2)
        logger.info(f"{prefix} Completed successfully in {elapsed}s")

        return {
            "status": "completed",
            "artifact_id": artifact_id,
            "elapsed_seconds": str(elapsed),
        }

    except Exception as e:
        elapsed = round(time.monotonic() - start_time, 2)
        logger.error(
            f"{prefix} Failed after {elapsed}s: {e}",
            exc_info=True,
        )

        # run_generation_task already writes ERROR status to the DB in
        # its own except block, so we don't duplicate that logic here.
        # We just let the exception propagate so ARQ marks the job as failed.
        raise
