from app.features.sources.model import Source
import uuid
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.features.notebooks.model import Notebook


class NotebookRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, notebook: Notebook) -> Notebook:
        self.db.add(notebook)
        await self.db.commit()
        await self.db.refresh(notebook)
        return notebook

    # FIXED: int → uuid.UUID for notebook_id and user_id
    async def get_by_id(self, notebook_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notebook]:
        result = await self.db.execute(
            select(Notebook).where(Notebook.id == notebook_id, Notebook.user_id == user_id)
        )
        return result.scalar_one_or_none()



    async def list_by_user(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ):
        stmt = (
            select(
                Notebook,
                func.count(Source.id).label("source_count"),
                func.count(Notebook.id).over().label("total_count"),
            )
            .outerjoin(Source, Source.notebook_id == Notebook.id)
            .where(Notebook.user_id == user_id)
            .group_by(Notebook.id)
            .offset(skip)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        rows = result.all()

        total = rows[0].total_count if rows else 0

        return rows, total

    async def count_by_user(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Notebook).where(Notebook.user_id == user_id)
        )
        return result.scalar_one()

    async def update(self, notebook: Notebook) -> Notebook:
        await self.db.commit()
        await self.db.refresh(notebook)
        return notebook

    async def delete(self, notebook: Notebook) -> None:
        await self.db.delete(notebook)
        await self.db.commit()