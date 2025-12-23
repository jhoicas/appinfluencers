"""
Influencer profile model with metrics and portfolio information.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class InfluencerProfile(Base):
    """
    Extended profile for influencer users.
    Contains social media metrics, rates, and portfolio.
    """
    __tablename__ = "influencer_profiles"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Key to User
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    
    # Profile Information
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Social Media Metrics
    instagram_handle: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    instagram_followers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    tiktok_handle: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tiktok_followers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    youtube_handle: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    youtube_subscribers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Engagement Metrics
    average_engagement_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Social Media Insights (stored as JSON)
    tiktok_insights: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Pricing
    suggested_rate_per_post: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    suggested_rate_per_story: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    suggested_rate_per_video: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Categories/Niches (stored as JSON array)
    categories: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Portfolio (array of URLs or objects)
    portfolio_items: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Statistics
    total_campaigns_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="influencer_profile")
    
    def __repr__(self) -> str:
        return f"<InfluencerProfile(id={self.id}, user_id={self.user_id})>"
