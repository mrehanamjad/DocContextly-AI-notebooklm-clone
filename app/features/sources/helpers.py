"""Qdrant helper functions shared across source modules."""

from qdrant_client.models import VectorParams, Distance, PayloadSchemaType
from app.core.logger import logger


def ensure_collection(client, collection_name: str, vector_size: int) -> None:
    """Create Qdrant collection and payload indexes if it doesn't exist."""
    collections = [c.name for c in client.get_collections().collections]
    if collection_name not in collections:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
        logger.info(f"Created Qdrant collection: {collection_name}")
    
    try:
        client.create_payload_index(
            collection_name=collection_name,
            field_name="user_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=collection_name,
            field_name="notebook_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=collection_name,
            field_name="source_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=collection_name,
            field_name="source_type",
            field_schema=PayloadSchemaType.KEYWORD,
        )
    except Exception as e:
        logger.error(f"Failed to create Qdrant payload indexes: {e}")


def collection_exists(client, collection_name: str) -> bool:
    collections = [c.name for c in client.get_collections().collections]
    return collection_name in collections
