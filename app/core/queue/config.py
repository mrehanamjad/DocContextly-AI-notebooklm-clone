"""Redis connection management and ARQ pool lifecycle.

This module owns the single ARQ connection pool used by the FastAPI web app
to enqueue jobs.  The worker process does NOT use this pool — ARQ creates its
own internal connection from the same ``RedisSettings``.

Lifecycle:
    1. ``create_arq_pool()`` — called once during FastAPI startup (lifespan).
    2. ``get_arq_pool()``    — called by services to enqueue jobs.
    3. ``close_arq_pool()``  — called once during FastAPI shutdown (lifespan).
"""

from __future__ import annotations

from urllib.parse import urlparse

from arq import create_pool, ArqRedis
from arq.connections import RedisSettings

from app.core.config import settings
from app.core.logger import logger


# ── Module-level pool reference ──────────────────────────────────────────────
# Populated by create_arq_pool(), consumed by get_arq_pool().
_arq_pool: ArqRedis | None = None


def get_redis_settings() -> RedisSettings:
    """Build ARQ ``RedisSettings`` from the centralized ``REDIS_URL``.

    Parses the URL to extract host, port, password, database, and SSL flag
    so we don't duplicate any connection details.
    """
    url = settings.REDIS_URL
    if not url:
        raise ValueError(
            "REDIS_URL is not configured.  "
            "Add it to your .env file to enable the task queue."
        )

    parsed = urlparse(url)

    return RedisSettings(
        host=parsed.hostname or "localhost",
        port=parsed.port or 6379,
        password=parsed.password,
        database=int(parsed.path.lstrip("/") or 0),
        ssl=parsed.scheme in ("rediss", "redis+ssl"),
        conn_timeout=10,
        conn_retries=5,
        conn_retry_delay=1.0,
    )


async def create_arq_pool() -> ArqRedis:
    """Create the global ARQ connection pool.

    Must be called exactly once — during FastAPI lifespan startup.
    """
    global _arq_pool
    if _arq_pool is not None:
        logger.warning("ARQ pool already exists — skipping creation")
        return _arq_pool

    _arq_pool = await create_pool(get_redis_settings())
    logger.info("ARQ Redis pool created successfully")
    return _arq_pool


def get_arq_pool() -> ArqRedis:
    """Return the active ARQ pool.

    Raises ``RuntimeError`` if the pool hasn't been initialised yet
    (i.e. the FastAPI lifespan hasn't run).
    """
    if _arq_pool is None:
        raise RuntimeError(
            "ARQ pool is not initialised.  "
            "Ensure create_arq_pool() is called during FastAPI startup."
        )
    return _arq_pool


async def close_arq_pool() -> None:
    """Gracefully close the ARQ pool.

    Called during FastAPI lifespan shutdown.
    """
    global _arq_pool
    if _arq_pool is not None:
        await _arq_pool.aclose()
        _arq_pool = None
        logger.info("ARQ Redis pool closed")
