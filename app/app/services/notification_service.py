"""
Notification service for user alerts and updates.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    """Service for notification management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notification_repo = NotificationRepository(db)
    
    async def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[int] = None
    ) -> Notification:
        """
        Create a new notification for a user.
        
        Args:
            user_id: Target user ID
            title: Notification title
            message: Notification message
            notification_type: Type of notification
            related_entity_type: Optional related entity type
            related_entity_id: Optional related entity ID
            
        Returns:
            Created notification
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            is_read=False,
        )
        
        notification = await self.notification_repo.create(notification)
        
        # In production, also send email notification here
        # await self._send_email_notification(notification)
        
        return notification
    
    async def get_user_notifications(
        self,
        user_id: int,
        is_read: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> list[Notification]:
        """
        Get notifications for a user.
        """
        return await self.notification_repo.get_by_user(
            user_id=user_id,
            is_read=is_read,
            skip=skip,
            limit=limit
        )
    
    async def mark_as_read(self, notification_id: int, user_id: int) -> Notification:
        """
        Mark a notification as read.
        """
        notification = await self.notification_repo.get_by_id(notification_id)
        
        if not notification:
            raise ValueError("Notification not found")
        
        if notification.user_id != user_id:
            raise ValueError("Not authorized to mark this notification as read")
        
        return await self.notification_repo.mark_as_read(notification)
    
    async def _send_email_notification(self, notification: Notification) -> None:
        """
        Send email notification (placeholder for MVP).
        
        In production, integrate with email service (SMTP, SendGrid, etc.)
        """
        # TODO: Implement email sending
        pass
