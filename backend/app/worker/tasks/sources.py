"""ARQ task wrapper for source indexing.

This module wraps the existing `index_source_background` pipeline from
`app.features.sources.tasks` as an ARQ-compatible async function.
"""

from __future__ import annotations

import time
import uuid

from app.core.logger import logger
from app.worker.context import get_worker_logger
from app.features.sources.model import SourceType
from app.core.queue.exceptions import (
    TransientWorkerError,
    FatalWorkerError,
    handle_transient_error,
)

async def index_source_job(
    ctx: dict,
    *,
    source_id: str,
    source_type: str,
    user_id: str,
    notebook_id: str,
) -> dict[str, str]:
    """ARQ task: background indexer for all source types.

    All arguments are plain serializable types.
    """
    prefix = get_worker_logger(ctx, extra={
        "source_id": source_id,
        "type": source_type,
    })
    start_time = time.monotonic()
    logger.info(f"{prefix} Starting source indexing")

    _source_type = SourceType(source_type)
    _user_id = uuid.UUID(user_id)
    _notebook_id = uuid.UUID(notebook_id)

    try:
        from app.features.sources.tasks import index_source_background
        
        await index_source_background(
            source_id=source_id,
            source_type=_source_type,
            user_id=_user_id,
            notebook_id=_notebook_id,
        )

        elapsed = round(time.monotonic() - start_time, 2)
        logger.info(f"{prefix} Completed successfully in {elapsed}s")

        return {
            "status": "completed",
            "source_id": source_id,
            "elapsed_seconds": str(elapsed),
        }

    except Exception as e:
        elapsed = round(time.monotonic() - start_time, 2)
        logger.error(f"{prefix} Failed after {elapsed}s: {e}", exc_info=True)
        
        # Check if the error is transient based on its type or string representation
        # ImageKit download failures (urllib), Qdrant timeouts, ConnectionErrors
        import urllib.error
        import httpx
        from qdrant_client.http.exceptions import UnexpectedResponse, RpcError

        err_str = str(e).lower()
        is_transient = isinstance(e, (
            urllib.error.URLError, 
            httpx.RequestError, 
            TimeoutError, 
            ConnectionError,
            RpcError
        )) or "timeout" in err_str or "rate limit" in err_str or "connection" in err_str

        if is_transient:
            logger.warning(f"{prefix} Transient error detected, attempting retry...")
            # Wrap and raise as TransientWorkerError to trigger exponential backoff
            t_err = TransientWorkerError(f"Transient error: {e}")
            handle_transient_error(t_err, ctx.get("job_try", 1))

        # Permanent error or exhausted retries
        raise
