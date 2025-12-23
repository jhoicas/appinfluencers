"""
Campaigns router for managing collaboration proposals.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.campaign_schemas import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    CampaignActionRequest
)
from app.services.campaign_service import CampaignService
from app.api.dependencies import (
    get_current_user,
    get_current_empresa_user,
    get_current_influencer_user
)

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_empresa_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new campaign proposal (Empresa only).
    
    Sends notification to the target influencer.
    """
    campaign_service = CampaignService(db)
    campaign = await campaign_service.create_campaign(current_user, campaign_data)
    
    return campaign


@router.get("/", response_model=list[CampaignResponse])
async def list_my_campaigns(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List campaigns for current user.
    
    - EMPRESA: Campaigns they created
    - INFLUENCER: Campaigns they received
    - ADMIN: All campaigns
    """
    from app.repositories.campaign_repository import CampaignRepository
    from app.models.user import UserRole
    
    campaign_repo = CampaignRepository(db)
    
    if current_user.role == UserRole.EMPRESA:
        campaigns = await campaign_repo.get_by_empresa(
            current_user.id, skip=skip, limit=limit
        )
    elif current_user.role == UserRole.INFLUENCER:
        campaigns = await campaign_repo.get_by_influencer(
            current_user.id, skip=skip, limit=limit
        )
    else:  # ADMIN
        campaigns = await campaign_repo.get_by_user(
            current_user.id, skip=skip, limit=limit
        )
    
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get campaign details.
    
    Only accessible by involved parties (empresa, influencer) or admin.
    """
    campaign_service = CampaignService(db)
    campaign = await campaign_service.get_campaign(campaign_id, current_user)
    
    return campaign


@router.post("/{campaign_id}/accept", response_model=CampaignResponse)
async def accept_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_influencer_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Accept a campaign proposal (Influencer only).
    
    Changes status to ACTIVA and enables messaging.
    """
    campaign_service = CampaignService(db)
    campaign = await campaign_service.accept_campaign(campaign_id, current_user)
    
    return campaign


@router.post("/{campaign_id}/reject", response_model=CampaignResponse)
async def reject_campaign(
    campaign_id: int,
    action_data: CampaignActionRequest,
    current_user: User = Depends(get_current_influencer_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a campaign proposal (Influencer only).
    """
    campaign_service = CampaignService(db)
    campaign = await campaign_service.reject_campaign(
        campaign_id,
        current_user,
        action_data.message
    )
    
    return campaign


@router.post("/{campaign_id}/negotiate", response_model=CampaignResponse)
async def negotiate_campaign(
    campaign_id: int,
    action_data: CampaignActionRequest,
    current_user: User = Depends(get_current_influencer_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Request negotiation on a campaign (Influencer only).
    
    Requires counter_budget in the request.
    """
    if not action_data.counter_budget:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="counter_budget is required for negotiation"
        )
    
    campaign_service = CampaignService(db)
    campaign = await campaign_service.negotiate_campaign(
        campaign_id,
        current_user,
        action_data.counter_budget,
        action_data.message
    )
    
    return campaign


@router.post("/{campaign_id}/complete", response_model=CampaignResponse)
async def complete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark campaign as completed (Empresa or Admin only).
    
    Triggers payment release process.
    """
    campaign_service = CampaignService(db)
    campaign = await campaign_service.complete_campaign(campaign_id, current_user)
    
    return campaign
