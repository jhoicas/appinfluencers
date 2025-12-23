"""
Unit tests for the CRITICAL 24-hour trial logic.

These tests verify the core business logic of the MVP:
1. Trial expiration after 24 hours
2. First profile view is allowed during trial
3. Second profile view is blocked during trial
4. Same profile can be viewed multiple times
5. Subscription bypasses trial restrictions
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.services.trial_service import TrialService
from app.core.config import settings


@pytest.mark.unit
class TestTrialLogic:
    """Test suite for trial service business logic."""
    
    @pytest.mark.asyncio
    async def test_trial_is_active_for_new_empresa(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test that trial is active for a newly registered EMPRESA user."""
        trial_service = TrialService(db_session)
        
        is_active = trial_service.is_trial_active(empresa_user)
        
        assert is_active is True
    
    @pytest.mark.asyncio
    async def test_trial_expiration(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test that trial expires after 24 hours."""
        trial_service = TrialService(db_session)
        
        # Set trial start time to 25 hours ago
        empresa_user.trial_start_time = datetime.utcnow() - timedelta(hours=25)
        
        is_active = trial_service.is_trial_active(empresa_user)
        
        assert is_active is False
    
    @pytest.mark.asyncio
    async def test_trial_not_active_with_subscription(
        self,
        db_session: AsyncSession,
        empresa_user_with_subscription: User
    ):
        """Test that trial is not active for users with subscription."""
        trial_service = TrialService(db_session)
        
        is_active = trial_service.is_trial_active(empresa_user_with_subscription)
        
        assert is_active is False
    
    @pytest.mark.asyncio
    async def test_first_profile_view_allowed(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test that first profile view is allowed during trial."""
        trial_service = TrialService(db_session)
        
        profile_id = 1
        can_view, reason = await trial_service.can_view_profile(empresa_user, profile_id)
        
        assert can_view is True
        assert reason is None
    
    @pytest.mark.asyncio
    async def test_second_profile_view_blocked(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """
        CRITICAL TEST: Test that second profile view is blocked during trial.
        This is the core business logic of the MVP.
        """
        trial_service = TrialService(db_session)
        
        # Record first profile view
        first_profile_id = 1
        await trial_service.record_profile_view(empresa_user, first_profile_id)
        
        # Try to view a different profile
        second_profile_id = 2
        can_view, reason = await trial_service.can_view_profile(empresa_user, second_profile_id)
        
        assert can_view is False
        assert reason == "FREE_PROFILE_LIMIT_REACHED"
    
    @pytest.mark.asyncio
    async def test_same_profile_can_be_viewed_multiple_times(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test that the same profile can be viewed multiple times during trial."""
        trial_service = TrialService(db_session)
        
        profile_id = 1
        
        # First view
        await trial_service.record_profile_view(empresa_user, profile_id)
        
        # Second view of same profile
        can_view, reason = await trial_service.can_view_profile(empresa_user, profile_id)
        
        assert can_view is True
        assert reason is None
    
    @pytest.mark.asyncio
    async def test_expired_trial_blocks_access(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test that expired trial blocks all profile access."""
        trial_service = TrialService(db_session)
        
        # Set trial start time to 25 hours ago
        empresa_user.trial_start_time = datetime.utcnow() - timedelta(hours=25)
        
        profile_id = 1
        can_view, reason = await trial_service.can_view_profile(empresa_user, profile_id)
        
        assert can_view is False
        assert reason == "TRIAL_EXPIRED"
    
    @pytest.mark.asyncio
    async def test_subscription_allows_unlimited_access(
        self,
        db_session: AsyncSession,
        empresa_user_with_subscription: User
    ):
        """Test that users with subscription have unlimited profile access."""
        trial_service = TrialService(db_session)
        
        # Try to view multiple profiles
        profile_id_1 = 1
        profile_id_2 = 2
        profile_id_3 = 3
        
        can_view_1, _ = await trial_service.can_view_profile(
            empresa_user_with_subscription, profile_id_1
        )
        can_view_2, _ = await trial_service.can_view_profile(
            empresa_user_with_subscription, profile_id_2
        )
        can_view_3, _ = await trial_service.can_view_profile(
            empresa_user_with_subscription, profile_id_3
        )
        
        assert can_view_1 is True
        assert can_view_2 is True
        assert can_view_3 is True
    
    @pytest.mark.asyncio
    async def test_non_empresa_users_have_full_access(
        self,
        db_session: AsyncSession,
        influencer_user: User
    ):
        """Test that non-EMPRESA users (influencers, admins) have full access."""
        trial_service = TrialService(db_session)
        
        profile_id = 1
        can_view, reason = await trial_service.can_view_profile(influencer_user, profile_id)
        
        assert can_view is True
        assert reason is None
    
    @pytest.mark.asyncio
    async def test_get_trial_status(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test getting detailed trial status."""
        trial_service = TrialService(db_session)
        
        status = trial_service.get_trial_status(empresa_user)
        
        assert status["has_trial"] is True
        assert status["is_active"] is True
        assert status["has_viewed_free_profile"] is False
        assert status["can_view_more_profiles"] is True
        assert "hours_remaining" in status
        assert status["hours_remaining"] > 0
    
    @pytest.mark.asyncio
    async def test_record_profile_view(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test recording a profile view."""
        trial_service = TrialService(db_session)
        
        profile_id = 1
        
        # Initially no profile viewed
        assert empresa_user.trial_profile_viewed_id is None
        
        # Record view
        await trial_service.record_profile_view(empresa_user, profile_id)
        
        # Refresh from database
        await db_session.refresh(empresa_user)
        
        # Profile ID should be recorded
        assert empresa_user.trial_profile_viewed_id == profile_id
    
    @pytest.mark.asyncio
    async def test_activate_subscription(
        self,
        db_session: AsyncSession,
        empresa_user: User
    ):
        """Test activating subscription for a user."""
        trial_service = TrialService(db_session)
        
        # Initially no subscription
        assert empresa_user.has_active_subscription is False
        
        # Activate subscription
        await trial_service.activate_subscription(empresa_user)
        
        # Refresh from database
        await db_session.refresh(empresa_user)
        
        # Subscription should be active
        assert empresa_user.has_active_subscription is True
