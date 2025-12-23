"""
Influencer profiles router with trial access control.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Cookie, Request
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.profile_schemas import (
    InfluencerProfileCreate,
    InfluencerProfileUpdate,
    InfluencerProfileResponse
)
from app.repositories.profile_repository import ProfileRepository
from app.models.profile import InfluencerProfile
from app.api.dependencies import (
    get_current_user,
    get_current_influencer_user,
    check_trial_access
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profiles", tags=["Influencer Profiles"])


async def fix_categories_in_request(request: Request) -> dict:
    """
    Dependency to intercept request body and fix categories array->object issue.
    Ejecuta ANTES de que Pydantic valide el schema.
    """
    body = await request.body()
    if not body:
        return {}
    
    data = json.loads(body.decode("utf-8"))
    
    # Fix categories if it's an object with numeric string keys
    if "categories" in data and isinstance(data["categories"], dict):
        keys = list(data["categories"].keys())
        if all(k.isdigit() for k in keys):
            # Convert {"0": "Moda", "1": "Belleza"} -> ["Moda", "Belleza"]
            sorted_keys = sorted(keys, key=int)
            data["categories"] = [data["categories"][k] for k in sorted_keys]
            logger.info(f"🔧 Fixed categories from object to array: {data['categories']}")
    
    return data


@router.post("/", response_model=InfluencerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    request: Request,
    current_user: User = Depends(get_current_influencer_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create influencer profile (Influencer only).
    
    Each influencer can only have one profile.
    """
    # Fix body ANTES de Pydantic validation
    fixed_data = await fix_categories_in_request(request)
    logger.info(f"🔵 Received profile data (after fix): {fixed_data}")
    
    # Validate with Pydantic manually
    try:
        profile_data = InfluencerProfileCreate(**fixed_data)
    except Exception as e:
        logger.error(f"❌ Pydantic validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    profile_repo = ProfileRepository(db)
    
    # Check if profile already exists
    existing_profile = await profile_repo.get_by_user_id(current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    # Create profile
    profile = InfluencerProfile(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    
    profile = await profile_repo.create(profile)
    
    return profile


@router.get("/", response_model=list[InfluencerProfileResponse])
async def list_profiles(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all influencer profiles (Explorer/Search).
    
    For EMPRESA users in trial: Shows list but blocks detailed view.
    """
    profile_repo = ProfileRepository(db)
    profiles = await profile_repo.get_all(skip=skip, limit=limit)
    
    return profiles


@router.get("/test")
async def test_endpoint():
    """Test endpoint without dependencies"""
    return {"message": "Test successful", "status": "ok"}


@router.get("/me", response_model=InfluencerProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_influencer_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get own influencer profile (Influencer only).
    """
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Create one first."
        )
    
    return profile


@router.get("/{profile_id}", response_model=InfluencerProfileResponse)
async def get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_trial_access)
):
    """
    Get detailed influencer profile.
    
    **CRITICAL ENDPOINT**: Enforces 24-hour trial logic for EMPRESA users.
    
    Trial Rules:
    - First profile view during trial: ALLOWED
    - Second profile view during trial: BLOCKED (403)
    - After trial expiration: BLOCKED (402)
    - With subscription: ALLOWED
    """
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_id(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.get("/user/{user_id}", response_model=InfluencerProfileResponse)
async def get_profile_by_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get influencer profile by user ID.
    """
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user"
        )
    
    return profile


@router.put("/me", response_model=InfluencerProfileResponse)
async def update_my_profile(
    request: Request,
    current_user: User = Depends(get_current_influencer_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update own influencer profile (Influencer only).
    """
    # Fix body ANTES de Pydantic validation
    fixed_data = await fix_categories_in_request(request)
    logger.info(f"🟡 Update profile data (after fix): {fixed_data}")
    
    # Validate with Pydantic manually
    try:
        profile_data = InfluencerProfileUpdate(**fixed_data)
    except Exception as e:
        logger.error(f"❌ Pydantic validation failed on update: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    profile_repo = ProfileRepository(db)
    profile = await profile_repo.get_by_user_id(current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Create one first."
        )
    
    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    profile = await profile_repo.update(profile)
    
    return profile
