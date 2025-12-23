"""
Repository layer for data access abstraction.
"""
from app.repositories.user_repository import UserRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.campaign_repository import CampaignRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.message_repository import MessageRepository

__all__ = [
    "UserRepository",
    "ProfileRepository",
    "CampaignRepository",
    "NotificationRepository",
    "MessageRepository",
]
