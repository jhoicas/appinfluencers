"""
Campaign model representing collaboration proposals between empresas and influencers.
"""
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class CampaignStatus(str, enum.Enum):
    """Campaign status enumeration."""
    PENDIENTE = "PENDIENTE"  # Proposal sent, awaiting influencer response
    ACTIVA = "ACTIVA"  # Accepted by influencer, work in progress
    NEGOCIACION = "NEGOCIACION"  # Influencer wants to negotiate terms
    RECHAZADA = "RECHAZADA"  # Rejected by influencer
    FINALIZADA = "FINALIZADA"  # Completed successfully
    CANCELADA = "CANCELADA"  # Cancelled by either party


class Campaign(Base):
    """
    Campaign model representing a collaboration proposal.
    Tracks the entire lifecycle from proposal to completion.
    """
    __tablename__ = "campaigns"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    empresa_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    influencer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Campaign Details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    briefing: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Financial
    proposed_budget: Mapped[float] = mapped_column(Float, nullable=False)
    final_budget: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Status
    status: Mapped[CampaignStatus] = mapped_column(
        Enum(CampaignStatus),
        default=CampaignStatus.PENDIENTE,
        nullable=False,
        index=True
    )
    
    # Deliverables
    deliverables: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timeline
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Rating (after completion)
    empresa_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    empresa_review: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    influencer_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    influencer_review: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
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
    empresa: Mapped["User"] = relationship(
        "User",
        back_populates="campaigns_created",
        foreign_keys=[empresa_id]
    )
    
    influencer: Mapped["User"] = relationship(
        "User",
        back_populates="campaigns_received",
        foreign_keys=[influencer_id]
    )
    
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="campaign",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Campaign(id={self.id}, title={self.title}, status={self.status})>"
