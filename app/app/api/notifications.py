"""
Notifications router for user alerts.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.notification_schemas import NotificationResponse
from app.services.notification_service import NotificationService
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationResponse])
async def list_my_notifications(
    is_read: bool = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List notifications for current user.
    
    Optional filter by read status.
    """
    notification_service = NotificationService(db)
    notifications = await notification_service.get_user_notifications(
        user_id=current_user.id,
        is_read=is_read,
        skip=skip,
        limit=limit
    )
    
    return notifications


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a notification as read.
    """
    notification_service = NotificationService(db)
    notification = await notification_service.mark_as_read(
        notification_id,
        current_user.id
    )
    
    return notification
