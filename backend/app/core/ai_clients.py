"""Singleton AI client instances.

Explicitly initialized during application startup via initialize_*().
Import and call the getter functions wherever needed.
"""

from qdrant_client import QdrantClient
from langchain_core.language_models import BaseChatModel
from langchain_core.embeddings import Embeddings
from app.core.config import settings
from app.core.providers.llm import get_llm_provider
from app.core.providers.embeddings import get_embedding_provider
from app.core.logger import logger

_qdrant_client: QdrantClient | None = None
_llm_client: BaseChatModel | None = None
_embedding_provider = None


def initialize_qdrant() -> None:
    """Initialize the Qdrant client."""
    global _qdrant_client
    if _qdrant_client is not None:
        return
    if not settings.QDRANT_URL:
        raise ValueError("QDRANT_URL is not configured in .env")
    logger.info(f"Connecting to Qdrant: {settings.QDRANT_URL}")
    _qdrant_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)


def get_qdrant_client() -> QdrantClient:
    """Return a singleton QdrantClient connected to cloud."""
    if _qdrant_client is None:
        raise RuntimeError("Qdrant client not initialized. Call initialize_qdrant() first.")
    return _qdrant_client


def initialize_llm() -> None:
    """Initialize the LLM client."""
    global _llm_client
    if _llm_client is not None:
        return
    logger.info(f"Connecting to LLM: {settings.LLM_PROVIDER}")
    provider = get_llm_provider()
    _llm_client = provider.get_llm()


def get_llm() -> BaseChatModel:
    """Return a singleton LLM instance."""
    if _llm_client is None:
        raise RuntimeError("LLM client not initialized. Call initialize_llm() first.")
    return _llm_client


def initialize_embeddings() -> None:
    """Initialize the embedding provider."""
    global _embedding_provider
    if _embedding_provider is not None:
        return
    logger.info(f"Connecting to Embeddings: {settings.EMBEDDING_PROVIDER}")
    _embedding_provider = get_embedding_provider()


def get_embeddings() -> Embeddings:
    """Return a singleton embeddings model."""
    if _embedding_provider is None:
        raise RuntimeError("Embeddings not initialized. Call initialize_embeddings() first.")
    return _embedding_provider.get_embeddings()


def get_vector_size() -> int:
    """Return the embedding dimensionality."""
    if _embedding_provider is None:
        raise RuntimeError("Embeddings not initialized. Call initialize_embeddings() first.")
    return _embedding_provider.get_vector_size()
