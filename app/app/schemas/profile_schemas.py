"""
Pydantic schemas for influencer profiles.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class InfluencerProfileCreate(BaseModel):
    """Schema for creating an influencer profile."""
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    instagram_handle: Optional[str] = None
    instagram_followers: Optional[int] = Field(None, ge=0)
    
    tiktok_handle: Optional[str] = None
    tiktok_followers: Optional[int] = Field(None, ge=0)
    
    youtube_handle: Optional[str] = None
    youtube_subscribers: Optional[int] = Field(None, ge=0)
    
    average_engagement_rate: Optional[float] = Field(None, ge=0, le=100)
    
    suggested_rate_per_post: Optional[float] = Field(None, ge=0)
    suggested_rate_per_story: Optional[float] = Field(None, ge=0)
    suggested_rate_per_video: Optional[float] = Field(None, ge=0)
    
    categories: Optional[List[str]] = None
    portfolio_items: Optional[dict] = None


class InfluencerProfileUpdate(BaseModel):
    """Schema for updating an influencer profile."""
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    instagram_handle: Optional[str] = None
    instagram_followers: Optional[int] = Field(None, ge=0)
    
    tiktok_handle: Optional[str] = None
    tiktok_followers: Optional[int] = Field(None, ge=0)
    
    youtube_handle: Optional[str] = None
    youtube_subscribers: Optional[int] = Field(None, ge=0)
    
    average_engagement_rate: Optional[float] = Field(None, ge=0, le=100)
    
    suggested_rate_per_post: Optional[float] = Field(None, ge=0)
    suggested_rate_per_story: Optional[float] = Field(None, ge=0)
    suggested_rate_per_video: Optional[float] = Field(None, ge=0)
    
    categories: Optional[List[str]] = None
    portfolio_items: Optional[dict] = None


class InfluencerProfileResponse(BaseModel):
    """Schema for influencer profile response."""
    id: int
    user_id: int
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    instagram_handle: Optional[str] = None
    instagram_followers: Optional[int] = None
    
    tiktok_handle: Optional[str] = None
    tiktok_followers: Optional[int] = None
    
    youtube_handle: Optional[str] = None
    youtube_subscribers: Optional[int] = None
    
    average_engagement_rate: Optional[float] = None
    
    suggested_rate_per_post: Optional[float] = None
    suggested_rate_per_story: Optional[float] = None
    suggested_rate_per_video: Optional[float] = None
    
    categories: Optional[List[str]] = None
    portfolio_items: Optional[dict] = None
    
    total_campaigns_completed: int
    average_rating: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
