from datetime import datetime

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note


class NoteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, note: Note) -> Note:
        """Create a new note."""
        self.session.add(note)
        await self.session.flush()
        await self.session.refresh(note)
        return note

    async def get_by_id(self, note_id: str) -> Note | None:
        """Get a note by ID."""
        result = await self.session.execute(select(Note).where(Note.id == note_id))
        return result.scalar_one_or_none()

    async def list_notes(
        self,
        cursor: datetime | None = None,
        limit: int = 20,
    ) -> list[Note]:
        """List notes with cursor pagination, newest first."""
        query = select(Note).order_by(desc(Note.created_at))

        if cursor:
            query = query.where(Note.created_at < cursor)

        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_notes_with_location(self, limit: int = 1000) -> list[Note]:
        """List notes that have location data."""
        query = (
            select(Note)
            .where(Note.lat.isnot(None))
            .where(Note.lon.isnot(None))
            .order_by(desc(Note.created_at))
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_by_country(self) -> list[dict]:
        """Get note counts grouped by country."""
        query = (
            select(Note.country_code, func.count(Note.id).label("count"))
            .where(Note.country_code.isnot(None))
            .group_by(Note.country_code)
            .order_by(desc("count"))
        )
        result = await self.session.execute(query)
        return [{"country_code": row.country_code, "count": row.count} for row in result.all()]

    async def get_total_count(self) -> int:
        """Get total note count."""
        query = select(func.count(Note.id))
        result = await self.session.execute(query)
        return result.scalar() or 0
