"""
Users router for user management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.user_schemas import UserResponse
from app.repositories.user_repository import UserRepository
from app.api.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    """
    return current_user


@router.get("/trial-status")
async def get_trial_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trial status for EMPRESA users.
    
    Returns detailed information about trial period and usage.
    """
    from app.services.trial_service import TrialService
    
    trial_service = TrialService(db)
    status_info = await trial_service.get_trial_status(current_user)
    
    return status_info


@router.get("/", response_model=list[UserResponse])
async def list_users(
    role: UserRole = None,
    is_approved: bool = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all users (Admin only).
    
    Optional filters:
    - **role**: Filter by user role
    - **is_approved**: Filter by approval status
    """
    user_repo = UserRepository(db)
    users = await user_repo.get_all(
        role=role,
        is_approved=is_approved,
        skip=skip,
        limit=limit
    )
    return users


@router.patch("/{user_id}/approve")
async def approve_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve a user (Admin only).
    
    Typically used to approve INFLUENCER registrations.
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_approved = True
    await user_repo.update(user)
    
    return {"message": "User approved successfully", "user_id": user_id}


@router.patch("/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a user (Admin only).
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    await user_repo.update(user)
    
    return {"message": "User deactivated successfully", "user_id": user_id}
