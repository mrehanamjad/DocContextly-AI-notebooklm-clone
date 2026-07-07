"""Shared ARQ + Redis queue infrastructure.

This package is importable from both the FastAPI web app (for enqueuing jobs)
and the ARQ worker process (for reading settings).  It intentionally contains
zero business logic — only connection management and helpers.
"""

from app.core.queue.config import get_redis_settings, create_arq_pool, get_arq_pool, close_arq_pool
from app.core.queue.exceptions import (
    WorkerException,
    TransientWorkerError,
    FatalWorkerError,
)

__all__ = [
    "get_redis_settings",
    "create_arq_pool",
    "get_arq_pool",
    "close_arq_pool",
    "WorkerException",
    "TransientWorkerError",
    "FatalWorkerError",
]
