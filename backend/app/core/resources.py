"""Centralized resource orchestration and lifecycle management.

This module is strictly an orchestration layer. It guarantees idempotency,
logs execution timings, and enforces a strict fail-fast initialization order.
It does NOT store Singletons itself; it defers to explicit `initialize_*()` 
functions in their respective domain modules.
"""

from __future__ import annotations

import time
import asyncio
from app.core.logger import logger
from app.core.config import settings
from app.database.session import async_engine
from app.core.queue.config import create_arq_pool, close_arq_pool
from app.core.ai_clients import (
    initialize_qdrant,
    initialize_embeddings,
    initialize_llm,
)
from app.core.providers.storage import initialize_storage_provider

_is_initialized = False


async def initialize_resources() -> None:
    """Orchestrate process-wide singleton initialization in strict order.
    
    Safe to call multiple times (idempotent).
    If any step fails, triggers shutdown to cleanup before re-raising.
    """
    global _is_initialized
    if _is_initialized:
        return

    logger.info("Initializing application resources...")
    start_total = time.monotonic()

    try:
        # 1. Validate configuration (Implicit via settings access)
        if not settings.DATABASE_URL:
            raise ValueError("DATABASE_URL is required")

        # 2. PostgreSQL engine
        # Already created at module level in session.py. We just log it.
        logger.info("PostgreSQL engine available")

        # 3. Redis / ARQ Pool
        t0 = time.monotonic()
        await create_arq_pool()
        logger.info(f"Redis pool initialized in {time.monotonic() - t0:.2f}s")

        # 4. Qdrant Client
        t0 = time.monotonic()
        # Qdrant client initialization is synchronous
        await asyncio.to_thread(initialize_qdrant)
        logger.info(f"Qdrant client initialized in {time.monotonic() - t0:.2f}s")

        # 5. Embedding Model
        t0 = time.monotonic()
        await asyncio.to_thread(initialize_embeddings)
        logger.info(f"Embedding model initialized in {time.monotonic() - t0:.2f}s")

        # 6. LLM Client
        t0 = time.monotonic()
        await asyncio.to_thread(initialize_llm)
        logger.info(f"LLM client initialized in {time.monotonic() - t0:.2f}s")

        # 7. Storage Provider
        t0 = time.monotonic()
        await asyncio.to_thread(initialize_storage_provider)
        logger.info(f"Storage provider initialized in {time.monotonic() - t0:.2f}s")

        _is_initialized = True
        logger.info(f"All resources initialized successfully in {time.monotonic() - start_total:.2f}s")

    except Exception as e:
        logger.error(f"Failed to initialize resources: {e}. Cleaning up...")
        await shutdown_resources()
        raise


async def shutdown_resources() -> None:
    """Safely tear down all process-wide resources."""
    global _is_initialized
    
    logger.info("Shutting down application resources...")

    try:
        await close_arq_pool()
    except Exception as e:
        logger.error(f"Error closing ARQ pool: {e}")

    try:
        await async_engine.dispose()
        logger.info("PostgreSQL engine disposed")
    except Exception as e:
        logger.error(f"Error disposing PostgreSQL engine: {e}")

    _is_initialized = False
    logger.info("Resource shutdown complete")
