"""
Pydantic schemas for campaigns.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from app.models.campaign import CampaignStatus


class CampaignCreate(BaseModel):
    """Schema for creating a campaign proposal."""
    influencer_id: int
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    briefing: Optional[str] = None
    proposed_budget: float = Field(..., gt=0)
    deliverables: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CampaignUpdate(BaseModel):
    """Schema for updating a campaign."""
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    briefing: Optional[str] = None
    proposed_budget: Optional[float] = Field(None, gt=0)
    final_budget: Optional[float] = Field(None, gt=0)
    deliverables: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[CampaignStatus] = None


class CampaignActionRequest(BaseModel):
    """Schema for campaign actions (accept, reject, negotiate)."""
    action: str = Field(..., pattern="^(accept|reject|negotiate)$")
    counter_budget: Optional[float] = Field(None, gt=0)
    message: Optional[str] = None


class CampaignResponse(BaseModel):
    """Schema for campaign response."""
    id: int
    empresa_id: int
    influencer_id: int
    title: str
    description: str
    briefing: Optional[str] = None
    proposed_budget: float
    final_budget: Optional[float] = None
    status: CampaignStatus
    deliverables: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    empresa_rating: Optional[int] = None
    empresa_review: Optional[str] = None
    influencer_rating: Optional[int] = None
    influencer_review: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
