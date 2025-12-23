"""
Message model for internal messaging between empresas and influencers.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Message(Base):
    """
    Message model for campaign-related communication.
    """
    __tablename__ = "messages"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    campaign_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    sender_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    receiver_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Message Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Attachments (optional, stored as JSON or comma-separated URLs)
    attachment_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="messages")
    
    sender: Mapped["User"] = relationship(
        "User",
        back_populates="messages_sent",
        foreign_keys=[sender_id]
    )
    
    receiver: Mapped["User"] = relationship(
        "User",
        back_populates="messages_received",
        foreign_keys=[receiver_id]
    )
    
    def __repr__(self) -> str:
        return f"<Message(id={self.id}, campaign_id={self.campaign_id}, sender_id={self.sender_id})>"
