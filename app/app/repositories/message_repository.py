"""
Repository for Message model data access.
"""
from typing import Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message


class MessageRepository:
    """Repository for Message CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, message: Message) -> Message:
        """Create a new message."""
        self.db.add(message)
        await self.db.flush()
        await self.db.refresh(message)
        return message
    
    async def get_by_id(self, message_id: int) -> Optional[Message]:
        """Get message by ID."""
        result = await self.db.execute(
            select(Message).where(Message.id == message_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_campaign(
        self,
        campaign_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Message]:
        """Get all messages for a campaign."""
        result = await self.db.execute(
            select(Message)
            .where(Message.campaign_id == campaign_id)
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_conversation(
        self,
        user1_id: int,
        user2_id: int,
        campaign_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[Message]:
        """Get conversation between two users for a specific campaign."""
        result = await self.db.execute(
            select(Message)
            .where(
                and_(
                    Message.campaign_id == campaign_id,
                    or_(
                        and_(
                            Message.sender_id == user1_id,
                            Message.receiver_id == user2_id
                        ),
                        and_(
                            Message.sender_id == user2_id,
                            Message.receiver_id == user1_id
                        )
                    )
                )
            )
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def mark_as_read(self, message: Message) -> Message:
        """Mark message as read."""
        from datetime import datetime
        message.is_read = True
        message.read_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(message)
        return message
