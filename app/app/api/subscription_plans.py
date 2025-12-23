"""
Subscription Plans router for managing pricing plans.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.subscription_plan import SubscriptionPlan
from app.schemas.subscription_schemas import (
    SubscriptionPlanCreate,
    SubscriptionPlanUpdate,
    SubscriptionPlanResponse
)
from app.repositories.subscription_plan_repository import SubscriptionPlanRepository
from app.api.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/subscription-plans", tags=["Subscription Plans"])


@router.get("/", response_model=List[SubscriptionPlanResponse])
async def list_plans(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    List all subscription plans.
    Public endpoint - anyone can view available plans.
    """
    repo = SubscriptionPlanRepository(db)
    plans = await repo.get_all(active_only=active_only)
    return plans


@router.get("/{plan_id}", response_model=SubscriptionPlanResponse)
async def get_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific subscription plan by ID."""
    repo = SubscriptionPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    return plan


@router.post("/", response_model=SubscriptionPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_data: SubscriptionPlanCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new subscription plan (Admin only).
    """
    repo = SubscriptionPlanRepository(db)
    
    plan = SubscriptionPlan(
        name=plan_data.name,
        description=plan_data.description,
        price=plan_data.price,
        price_display=plan_data.price_display,
        billing_period=plan_data.billing_period,
        features=plan_data.features,
        is_featured=plan_data.is_featured,
        is_active=plan_data.is_active,
        display_order=plan_data.display_order
    )
    
    plan = await repo.create(plan)
    return plan


@router.patch("/{plan_id}", response_model=SubscriptionPlanResponse)
async def update_plan(
    plan_id: int,
    plan_data: SubscriptionPlanUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a subscription plan (Admin only).
    """
    repo = SubscriptionPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    # Update fields
    update_data = plan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    plan = await repo.update(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a subscription plan (Admin only).
    """
    repo = SubscriptionPlanRepository(db)
    plan = await repo.get_by_id(plan_id)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    await repo.delete(plan)
    return None
