"""Worker context helpers — dependency injection without FastAPI.

ARQ workers cannot use ``fastapi.Depends()``.  This module provides
lightweight helpers that task functions call to obtain the resources
they need (DB sessions, repositories, services) inside a properly
scoped async context.

Usage in a task function::

    from app.worker.context import worker_db_session

    async def my_task(ctx: dict, artifact_id: UUID, ...):
        async with worker_db_session() as db:
            repo = ArtifactRepository(db)
            ...
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import AsyncSessionLocal
from app.core.logger import logger


@asynccontextmanager
async def worker_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield a scoped async DB session for use inside a worker task.

    The session is committed on clean exit and rolled back on exception,
    then always closed — identical to the FastAPI ``get_db`` dependency
    but usable as a plain context manager.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_worker_logger(
    ctx: dict,
    *,
    extra: dict | None = None,
) -> str:
    """Build a structured log prefix from the ARQ context.

    Every worker log line should start with this prefix so that job
    execution can be traced across retries and failures::

        prefix = get_worker_logger(ctx, extra={"artifact_id": str(aid)})
        logger.info(f"{prefix} Starting generation")

    Returns a string like:
        ``[job=abc123 try=1 fn=generate_text_artifact]``
    """
    job_id = ctx.get("job_id", "unknown")
    job_try = ctx.get("job_try", 0)
    fn_name = ctx.get("job_name", "unknown")

    parts = [
        f"job={job_id}",
        f"try={job_try}",
        f"fn={fn_name}",
    ]

    if extra:
        for key, value in extra.items():
            parts.append(f"{key}={value}")

    return f"[{' '.join(parts)}]"
