"""
Repository for Campaign model data access.
"""
from typing import Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.campaign import Campaign, CampaignStatus


class CampaignRepository:
    """Repository for Campaign CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, campaign: Campaign) -> Campaign:
        """Create a new campaign."""
        self.db.add(campaign)
        await self.db.flush()
        await self.db.refresh(campaign)
        return campaign
    
    async def get_by_id(self, campaign_id: int) -> Optional[Campaign]:
        """Get campaign by ID with relationships."""
        result = await self.db.execute(
            select(Campaign)
            .options(
                joinedload(Campaign.empresa),
                joinedload(Campaign.influencer)
            )
            .where(Campaign.id == campaign_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_empresa(
        self,
        empresa_id: int,
        status: Optional[CampaignStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> list[Campaign]:
        """Get campaigns created by an empresa."""
        query = select(Campaign).where(Campaign.empresa_id == empresa_id)
        
        if status:
            query = query.where(Campaign.status == status)
        
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_by_influencer(
        self,
        influencer_id: int,
        status: Optional[CampaignStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> list[Campaign]:
        """Get campaigns received by an influencer."""
        query = select(Campaign).where(Campaign.influencer_id == influencer_id)
        
        if status:
            query = query.where(Campaign.status == status)
        
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Campaign]:
        """Get all campaigns involving a user (as empresa or influencer)."""
        result = await self.db.execute(
            select(Campaign)
            .where(
                or_(
                    Campaign.empresa_id == user_id,
                    Campaign.influencer_id == user_id
                )
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update(self, campaign: Campaign) -> Campaign:
        """Update campaign."""
        await self.db.flush()
        await self.db.refresh(campaign)
        return campaign
    
    async def delete(self, campaign: Campaign) -> None:
        """Delete campaign."""
        await self.db.delete(campaign)
        await self.db.flush()
