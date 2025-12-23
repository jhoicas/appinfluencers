"""
Repository for InfluencerProfile model data access.
"""
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.profile import InfluencerProfile


class ProfileRepository:
    """Repository for InfluencerProfile CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, profile: InfluencerProfile) -> InfluencerProfile:
        """Create a new influencer profile."""
        self.db.add(profile)
        await self.db.flush()
        await self.db.refresh(profile)
        return profile
    
    async def get_by_id(self, profile_id: int) -> Optional[InfluencerProfile]:
        """Get profile by ID."""
        result = await self.db.execute(
            select(InfluencerProfile)
            .options(joinedload(InfluencerProfile.user))
            .where(InfluencerProfile.id == profile_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user_id(self, user_id: int) -> Optional[InfluencerProfile]:
        """Get profile by user ID."""
        result = await self.db.execute(
            select(InfluencerProfile)
            .options(joinedload(InfluencerProfile.user))
            .where(InfluencerProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> list[InfluencerProfile]:
        """Get all influencer profiles."""
        result = await self.db.execute(
            select(InfluencerProfile)
            .options(joinedload(InfluencerProfile.user))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update(self, profile: InfluencerProfile) -> InfluencerProfile:
        """Update profile."""
        await self.db.flush()
        await self.db.refresh(profile)
        return profile
    
    async def delete(self, profile: InfluencerProfile) -> None:
        """Delete profile."""
        await self.db.delete(profile)
        await self.db.flush()
