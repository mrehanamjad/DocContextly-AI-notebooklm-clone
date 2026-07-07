"""ARQ task wrapper for media generation (Voice Overview).

This module wraps the existing ``run_voice_overview_generation_task`` pipeline
as an ARQ-compatible async function.
"""

from __future__ import annotations

import time
import uuid
from typing import Any

from app.core.logger import logger
from app.worker.context import get_worker_logger
from app.core.queue.exceptions import (
    TransientWorkerError,
    FatalWorkerError,
    handle_transient_error,
)
from app.features.artifacts.schema import ArtifactType


async def generate_voice_overview(
    ctx: dict,
    *,
    artifact_id: str,
    notebook_id: str,
    user_id: str,
    request_prompt: str | None,
    options: dict[str, Any],
    resolved_ids: list[str],
) -> dict[str, str]:
    """ARQ task: generate a voice overview artifact (podcast-style audio).

    Delegates to the existing pipeline which handles text-to-speech,
    file creation, ImageKit upload, and status updates.
    """
    prefix = get_worker_logger(ctx, extra={
        "artifact_id": artifact_id,
        "notebook_id": notebook_id,
        "type": ArtifactType.VOICE_OVERVIEW.value,
    })
    start_time = time.monotonic()
    logger.info(f"{prefix} Starting voice overview generation")

    _artifact_id = uuid.UUID(artifact_id)
    _notebook_id = uuid.UUID(notebook_id)
    _user_id = uuid.UUID(user_id)

    try:
        from app.features.artifacts.tasks import run_voice_overview_generation_task

        await run_voice_overview_generation_task(
            artifact_id=_artifact_id,
            notebook_id=_notebook_id,
            user_id=_user_id,
            request_prompt=request_prompt,
            options=options,
            resolved_ids=resolved_ids,
        )

        elapsed = round(time.monotonic() - start_time, 2)
        logger.info(f"{prefix} Voice overview completed successfully in {elapsed}s")

        return {
            "status": "completed",
            "artifact_id": artifact_id,
            "elapsed_seconds": str(elapsed),
        }

    except Exception as e:
        elapsed = round(time.monotonic() - start_time, 2)
        logger.error(f"{prefix} Failed after {elapsed}s: {e}")

        # Determine if the error is transient based on string matching or exception types
        error_str = str(e).lower()
        transient_indicators = [
            "timeout", "rate limit", "connection", "network", "502", "503", "504",
            "imagekit", "tts", "edge-tts", "socket"
        ]

        is_transient = any(indicator in error_str for indicator in transient_indicators)
        
        job_try = ctx.get("job_try", 1)

        if is_transient:
            logger.warning(f"{prefix} Detected transient error. Attempting retry.")
            handle_transient_error(e, job_try)
        
        # If not transient or max retries exceeded, it's fatal
        raise FatalWorkerError(f"Permanent failure during voice generation: {e}") from e
