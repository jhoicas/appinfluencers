"""
Repository for subscription plan operations.
"""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription_plan import SubscriptionPlan


class SubscriptionPlanRepository:
    """Repository for subscription plan database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, plan: SubscriptionPlan) -> SubscriptionPlan:
        """Create a new subscription plan."""
        self.db.add(plan)
        await self.db.commit()
        await self.db.refresh(plan)
        return plan
    
    async def get_by_id(self, plan_id: int) -> Optional[SubscriptionPlan]:
        """Get a subscription plan by ID."""
        result = await self.db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, active_only: bool = False) -> List[SubscriptionPlan]:
        """Get all subscription plans, optionally filtered by active status."""
        query = select(SubscriptionPlan).order_by(SubscriptionPlan.display_order)
        
        if active_only:
            query = query.where(SubscriptionPlan.is_active == True)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def update(self, plan: SubscriptionPlan) -> SubscriptionPlan:
        """Update a subscription plan."""
        await self.db.commit()
        await self.db.refresh(plan)
        return plan
    
    async def delete(self, plan: SubscriptionPlan) -> None:
        """Delete a subscription plan."""
        await self.db.delete(plan)
        await self.db.commit()
