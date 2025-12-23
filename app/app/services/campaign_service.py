"""
Campaign service for managing collaboration proposals.
"""
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.campaign import Campaign, CampaignStatus
from app.repositories.campaign_repository import CampaignRepository
from app.repositories.user_repository import UserRepository
from app.schemas.campaign_schemas import CampaignCreate, CampaignUpdate
from app.services.notification_service import NotificationService


class CampaignService:
    """Service for campaign management."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.campaign_repo = CampaignRepository(db)
        self.user_repo = UserRepository(db)
        self.notification_service = NotificationService(db)
    
    async def create_campaign(
        self,
        empresa_user: User,
        campaign_data: CampaignCreate
    ) -> Campaign:
        """
        Create a new campaign proposal.
        
        Business Rules:
        - Only EMPRESA users can create campaigns
        - Influencer must exist and be approved
        - Campaign starts in PENDIENTE status
        - Influencer receives notification
        """
        # Verify empresa role
        if empresa_user.role != UserRole.EMPRESA:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only EMPRESA users can create campaigns"
            )
        
        # Verify empresa has active subscription or trial
        if not empresa_user.has_active_subscription:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Active subscription required to create campaigns"
            )
        
        # Verify influencer exists and is approved
        influencer = await self.user_repo.get_by_id(campaign_data.influencer_id)
        if not influencer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Influencer not found"
            )
        
        if influencer.role != UserRole.INFLUENCER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target user is not an influencer"
            )
        
        if not influencer.is_approved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Influencer not approved yet"
            )
        
        # Create campaign
        campaign = Campaign(
            empresa_id=empresa_user.id,
            influencer_id=campaign_data.influencer_id,
            title=campaign_data.title,
            description=campaign_data.description,
            briefing=campaign_data.briefing,
            proposed_budget=campaign_data.proposed_budget,
            deliverables=campaign_data.deliverables,
            start_date=campaign_data.start_date,
            end_date=campaign_data.end_date,
            status=CampaignStatus.PENDIENTE,
        )
        
        campaign = await self.campaign_repo.create(campaign)
        
        # Send notification to influencer
        await self.notification_service.create_notification(
            user_id=influencer.id,
            title="New Campaign Proposal",
            message=f"You have received a new campaign proposal: {campaign.title}",
            notification_type="CAMPAIGN_PROPOSAL",
            related_entity_type="campaign",
            related_entity_id=campaign.id
        )
        
        return campaign
    
    async def get_campaign(self, campaign_id: int, user: User) -> Campaign:
        """
        Get campaign by ID with authorization check.
        """
        campaign = await self.campaign_repo.get_by_id(campaign_id)
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        # Check authorization
        if user.role != UserRole.ADMIN:
            if campaign.empresa_id != user.id and campaign.influencer_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this campaign"
                )
        
        return campaign
    
    async def accept_campaign(
        self,
        campaign_id: int,
        influencer_user: User
    ) -> Campaign:
        """
        Accept a campaign proposal (Influencer action).
        
        Business Rules:
        - Only the target influencer can accept
        - Campaign must be in PENDIENTE or NEGOCIACION status
        - Status changes to ACTIVA
        - Empresa receives notification
        """
        campaign = await self.get_campaign(campaign_id, influencer_user)
        
        # Verify influencer
        if campaign.influencer_id != influencer_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the target influencer can accept this campaign"
            )
        
        # Verify status
        if campaign.status not in [CampaignStatus.PENDIENTE, CampaignStatus.NEGOCIACION]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept campaign in {campaign.status} status"
            )
        
        # Update status
        campaign.status = CampaignStatus.ACTIVA
        campaign = await self.campaign_repo.update(campaign)
        
        # Notify empresa
        await self.notification_service.create_notification(
            user_id=campaign.empresa_id,
            title="Campaign Accepted",
            message=f"Your campaign '{campaign.title}' has been accepted!",
            notification_type="CAMPAIGN_ACCEPTED",
            related_entity_type="campaign",
            related_entity_id=campaign.id
        )
        
        return campaign
    
    async def reject_campaign(
        self,
        campaign_id: int,
        influencer_user: User,
        message: Optional[str] = None
    ) -> Campaign:
        """
        Reject a campaign proposal (Influencer action).
        """
        campaign = await self.get_campaign(campaign_id, influencer_user)
        
        # Verify influencer
        if campaign.influencer_id != influencer_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the target influencer can reject this campaign"
            )
        
        # Verify status
        if campaign.status not in [CampaignStatus.PENDIENTE, CampaignStatus.NEGOCIACION]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject campaign in {campaign.status} status"
            )
        
        # Update status
        campaign.status = CampaignStatus.RECHAZADA
        campaign = await self.campaign_repo.update(campaign)
        
        # Notify empresa
        notification_message = f"Your campaign '{campaign.title}' has been rejected."
        if message:
            notification_message += f" Reason: {message}"
        
        await self.notification_service.create_notification(
            user_id=campaign.empresa_id,
            title="Campaign Rejected",
            message=notification_message,
            notification_type="CAMPAIGN_REJECTED",
            related_entity_type="campaign",
            related_entity_id=campaign.id
        )
        
        return campaign
    
    async def negotiate_campaign(
        self,
        campaign_id: int,
        influencer_user: User,
        counter_budget: float,
        message: Optional[str] = None
    ) -> Campaign:
        """
        Request negotiation on a campaign (Influencer action).
        """
        campaign = await self.get_campaign(campaign_id, influencer_user)
        
        # Verify influencer
        if campaign.influencer_id != influencer_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the target influencer can negotiate this campaign"
            )
        
        # Verify status
        if campaign.status != CampaignStatus.PENDIENTE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot negotiate campaign in {campaign.status} status"
            )
        
        # Update status and budget
        campaign.status = CampaignStatus.NEGOCIACION
        campaign.final_budget = counter_budget
        campaign = await self.campaign_repo.update(campaign)
        
        # Notify empresa
        notification_message = f"Negotiation requested for '{campaign.title}'. Counter offer: ${counter_budget}"
        if message:
            notification_message += f" Message: {message}"
        
        await self.notification_service.create_notification(
            user_id=campaign.empresa_id,
            title="Campaign Negotiation",
            message=notification_message,
            notification_type="CAMPAIGN_NEGOTIATION",
            related_entity_type="campaign",
            related_entity_id=campaign.id
        )
        
        return campaign
    
    async def complete_campaign(
        self,
        campaign_id: int,
        user: User
    ) -> Campaign:
        """
        Mark campaign as completed.
        """
        campaign = await self.get_campaign(campaign_id, user)
        
        # Only empresa or admin can mark as completed
        if user.role not in [UserRole.EMPRESA, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only EMPRESA or ADMIN can mark campaign as completed"
            )
        
        if campaign.status != CampaignStatus.ACTIVA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only active campaigns can be completed"
            )
        
        campaign.status = CampaignStatus.FINALIZADA
        campaign = await self.campaign_repo.update(campaign)
        
        # Notify influencer
        await self.notification_service.create_notification(
            user_id=campaign.influencer_id,
            title="Campaign Completed",
            message=f"Campaign '{campaign.title}' has been marked as completed!",
            notification_type="CAMPAIGN_COMPLETED",
            related_entity_type="campaign",
            related_entity_id=campaign.id
        )
        
        return campaign
