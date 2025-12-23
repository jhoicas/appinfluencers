"""
FastAPI dependencies for authentication and authorization.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.services.auth_service import AuthService
from app.services.trial_service import TrialService

# Security scheme (for Swagger UI)
security = HTTPBearer(auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    access_token: Optional[str] = Cookie(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    Supports both Cookie (httpOnly) and Authorization header (for Swagger).
    """
    # Try to get token from cookie first (production), then from header (Swagger)
    token = access_token or (credentials.credentials if credentials else None)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user ID
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(user_id)
    
    return user


async def get_current_empresa_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure current user is an EMPRESA.
    """
    if current_user.role != UserRole.EMPRESA:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="EMPRESA role required"
        )
    return current_user


async def get_current_influencer_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure current user is an INFLUENCER.
    """
    if current_user.role != UserRole.INFLUENCER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="INFLUENCER role required"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure current user is an ADMIN.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ADMIN role required"
        )
    return current_user


async def check_trial_access(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    CRITICAL DEPENDENCY: Enforces the 24-hour trial logic for EMPRESA users.
    
    This middleware checks if an EMPRESA user can view an influencer profile
    based on their trial status and subscription.
    
    Business Rules:
    - Non-EMPRESA users: Full access
    - EMPRESA with subscription: Full access
    - EMPRESA in trial (first profile): Allow and record
    - EMPRESA in trial (same profile): Allow
    - EMPRESA in trial (different profile): Block with 403
    - EMPRESA with expired trial: Block with 402
    """
    # Only apply trial logic to EMPRESA users
    if current_user.role != UserRole.EMPRESA:
        return current_user
    
    # Users with subscription have full access
    if current_user.has_active_subscription:
        return current_user
    
    # Check trial access
    trial_service = TrialService(db)
    can_view, reason = await trial_service.can_view_profile(current_user, profile_id)
    
    if not can_view:
        if reason == "TRIAL_EXPIRED":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Your 24-hour trial has expired. Please subscribe to continue accessing profiles."
            )
        elif reason == "FREE_PROFILE_LIMIT_REACHED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You have already viewed your free profile during the trial. Please subscribe to view more profiles."
            )
    
    # Record profile view if this is the first one
    if not trial_service.has_viewed_free_profile(current_user):
        await trial_service.record_profile_view(current_user, profile_id)
    
    return current_user
