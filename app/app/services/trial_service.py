"""
Trial service implementing the 24-hour free trial logic for EMPRESA users.
This is the CRITICAL business logic for the MVP.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository


class TrialService:
    """
    Service for managing the 24-hour free trial for EMPRESA users.
    
    Business Rules:
    1. EMPRESA users get 24 hours of trial access from registration
    2. During trial, they can view ONE complete influencer profile
    3. After viewing one profile OR after 24 hours, access is blocked
    4. Must subscribe to continue accessing profiles
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    def is_trial_active(self, user: User) -> bool:
        """
        Check if user's trial is still active.
        
        Args:
            user: The EMPRESA user to check
            
        Returns:
            bool: True if trial is active, False if expired
        """
        if user.role != UserRole.EMPRESA:
            return False
        
        if user.has_active_subscription:
            return False
        
        if not user.trial_start_time:
            return False
        
        # Ensure trial_start_time is timezone-aware (MySQL may return naive datetime)
        trial_start = user.trial_start_time
        if trial_start.tzinfo is None:
            trial_start = trial_start.replace(tzinfo=timezone.utc)
        
        # Calculate trial expiration
        trial_duration = timedelta(hours=settings.TRIAL_DURATION_HOURS)
        trial_end_time = trial_start + trial_duration
        
        # Check if trial has expired
        if datetime.now(timezone.utc) > trial_end_time:
            return False
        
        return True
    
    def has_viewed_free_profile(self, user: User) -> bool:
        """
        Check if user has already viewed their free profile.
        
        Args:
            user: The EMPRESA user to check
            
        Returns:
            bool: True if user has viewed a profile, False otherwise
        """
        return user.trial_profile_viewed_id is not None
    
    async def can_view_profile(self, user: User, profile_id: int) -> tuple[bool, Optional[str]]:
        """
        Check if EMPRESA user can view a specific influencer profile.
        
        Business Logic:
        - If user has active subscription: ALLOW
        - If trial is expired: BLOCK (return payment required)
        - If this is the first profile view during trial: ALLOW and record
        - If user already viewed a different profile: BLOCK (return payment required)
        - If user is viewing the same profile they already viewed: ALLOW
        
        Args:
            user: The EMPRESA user
            profile_id: The influencer profile ID to view
            
        Returns:
            tuple: (can_view: bool, reason: Optional[str])
        """
        # Non-EMPRESA users have full access
        if user.role != UserRole.EMPRESA:
            return True, None
        
        # Users with active subscription have full access
        if user.has_active_subscription:
            return True, None
        
        # Check if trial is active
        if not self.is_trial_active(user):
            return False, "TRIAL_EXPIRED"
        
        # Check if user has already viewed a profile
        if not self.has_viewed_free_profile(user):
            # This is the first profile view - ALLOW
            return True, None
        
        # User has viewed a profile before
        # Check if it's the same profile
        if user.trial_profile_viewed_id == profile_id:
            # Same profile - ALLOW
            return True, None
        else:
            # Different profile - BLOCK
            return False, "FREE_PROFILE_LIMIT_REACHED"
    
    async def record_profile_view(self, user: User, profile_id: int) -> User:
        """
        Record that a user has viewed a profile during their trial.
        
        Args:
            user: The EMPRESA user
            profile_id: The profile that was viewed
            
        Returns:
            Updated user object
        """
        if user.role != UserRole.EMPRESA:
            return user
        
        if user.has_active_subscription:
            return user
        
        # Only record if this is the first profile view
        if not self.has_viewed_free_profile(user):
            user.trial_profile_viewed_id = profile_id
            await self.user_repo.update(user)
        
        return user
    
    async def get_trial_status(self, user: User) -> dict:
        """
        Get detailed trial status for a user.
        
        Args:
            user: The EMPRESA user
            
        Returns:
            dict with trial status information
        """
        if user.role != UserRole.EMPRESA:
            return {
                "has_trial": False,
                "message": "Trial only available for EMPRESA users"
            }
        
        if user.has_active_subscription:
            return {
                "has_trial": False,
                "has_subscription": True,
                "message": "User has active subscription"
            }
        
        # Auto-initialize trial if not set (for legacy users)
        if not user.trial_start_time:
            user.trial_start_time = datetime.now(timezone.utc)
            await self.user_repo.update(user)
        
        # Ensure trial_start_time is timezone-aware (MySQL may return naive datetime)
        trial_start = user.trial_start_time
        if trial_start.tzinfo is None:
            trial_start = trial_start.replace(tzinfo=timezone.utc)
        
        trial_duration = timedelta(hours=settings.TRIAL_DURATION_HOURS)
        trial_end_time = trial_start + trial_duration
        time_remaining = trial_end_time - datetime.now(timezone.utc)
        
        is_active = self.is_trial_active(user)
        has_viewed = self.has_viewed_free_profile(user)
        
        return {
            "has_trial": True,
            "is_active": is_active,
            "trial_start": user.trial_start_time.isoformat(),
            "trial_end": trial_end_time.isoformat(),
            "hours_remaining": max(0, time_remaining.total_seconds() / 3600),
            "has_viewed_free_profile": has_viewed,
            "viewed_profile_id": user.trial_profile_viewed_id,
            "can_view_more_profiles": is_active and not has_viewed,
        }
    
    async def activate_subscription(self, user: User) -> User:
        """
        Activate subscription for a user (called after successful payment).
        
        Args:
            user: The EMPRESA user
            
        Returns:
            Updated user object
        """
        user.has_active_subscription = True
        await self.user_repo.update(user)
        return user
