"""ARQ worker entry point.

Start the worker with::

    arq app.worker.main.WorkerSettings

This module defines:
    - ``startup``   — one-time initialisation (DB engine, AI clients, logger).
    - ``shutdown``  — graceful teardown (dispose DB engine).
    - ``WorkerSettings`` — ARQ configuration that ties everything together.
"""

from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.logger import setup_logger
from app.core.queue.config import get_redis_settings
from app.worker.tasks import TASK_FUNCTIONS

# ── Import all models so SQLAlchemy can resolve string relationships ─────────
from app.features.users.model import User
from app.features.notebooks.model import Notebook
from app.features.sources.model import Source
from app.features.chat.model import ChatSession, ChatMessage, MemorySummary
from app.features.artifacts.model import Artifact


# ── Dedicated worker logger ──────────────────────────────────────────────────
# Separate from the web app logger so log files don't interleave.
worker_logger = setup_logger("arq_worker")


async def startup(ctx: dict[str, Any]) -> None:
    """Called once when the worker process boots.

    Initialises shared resources and stores them in ``ctx`` so every
    task function can access them without re-creating connections.
    """
    worker_logger.info("Worker starting up …")

    from app.core.resources import initialize_resources, shutdown_resources
    
    try:
        await initialize_resources()
    except Exception as e:
        worker_logger.error(f"Worker failed to initialize resources: {e}")
        raise
        
    # ── Map to ctx to preserve task business logic ────────
    from app.database.session import async_engine
    ctx["db_engine"] = async_engine

    from app.core.ai_clients import get_llm, get_qdrant_client, get_embeddings
    ctx["llm"] = get_llm()
    ctx["qdrant"] = get_qdrant_client()
    ctx["embeddings"] = get_embeddings()

    from app.core.providers.storage import get_storage_provider
    ctx["storage"] = get_storage_provider()

    worker_logger.info("Worker startup complete ✓")


async def shutdown(ctx: dict[str, Any]) -> None:
    """Called once when the worker process is shutting down."""
    worker_logger.info("Worker shutting down …")
    from app.core.resources import shutdown_resources
    await shutdown_resources()
    worker_logger.info("Worker shutdown complete ✓")


# ── ARQ Worker Configuration ─────────────────────────────────────────────────

class WorkerSettings:
    """Configuration class consumed by ``arq`` CLI.

    Run with:  ``arq app.worker.main.WorkerSettings``
    """

    # Task functions registered for this worker.
    functions = TASK_FUNCTIONS

    # Redis connection — reuses the same REDIS_URL as the FastAPI app.
    redis_settings = get_redis_settings()

    # Lifecycle hooks.
    on_startup = startup
    on_shutdown = shutdown

    # ── Tuning ────────────────────────────────────────────────────────────
    # Maximum number of jobs running concurrently in this worker.
    max_jobs = 10

    # Time (seconds) before a running job is considered timed out.
    # Set to 900s (15 min) to accommodate heavy workloads like
    # large PDF indexing and voice overview synthesis.
    job_timeout = 900

    # How long to wait for active jobs to finish during a graceful shutdown (SIGTERM).
    job_completion_wait = 30

    # How long a job result is kept in Redis after completion (seconds).
    keep_result = 3600

    # How long to wait between polling Redis for new jobs (seconds).
    poll_delay = 0.5

    # Maximum number of times a job can be retried (via arq.Retry).
    max_tries = 4
