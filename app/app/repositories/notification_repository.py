"""
Repository for Notification model data access.
"""
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    """Repository for Notification CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, notification: Notification) -> Notification:
        """Create a new notification."""
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)
        return notification
    
    async def get_by_id(self, notification_id: int) -> Optional[Notification]:
        """Get notification by ID."""
        result = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user(
        self,
        user_id: int,
        is_read: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> list[Notification]:
        """Get notifications for a user."""
        query = select(Notification).where(Notification.user_id == user_id)
        
        if is_read is not None:
            query = query.where(Notification.is_read == is_read)
        
        query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def mark_as_read(self, notification: Notification) -> Notification:
        """Mark notification as read."""
        from datetime import datetime
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(notification)
        return notification
    
    async def delete(self, notification: Notification) -> None:
        """Delete notification."""
        await self.db.delete(notification)
        await self.db.flush()
