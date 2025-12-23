"""
User model representing all user types in the platform.
Implements role-based access control (RBAC).
"""
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration for RBAC."""
    EMPRESA = "EMPRESA"
    INFLUENCER = "INFLUENCER"
    ADMIN = "ADMIN"


class User(Base):
    """
    User model for authentication and authorization.
    Supports three roles: EMPRESA, INFLUENCER, and ADMIN.
    """
    __tablename__ = "users"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Authentication
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Profile
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Trial Management (for EMPRESA users)
    trial_start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    trial_profile_viewed_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    has_active_subscription: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
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
    influencer_profile: Mapped[Optional["InfluencerProfile"]] = relationship(
        "InfluencerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    campaigns_created: Mapped[list["Campaign"]] = relationship(
        "Campaign",
        back_populates="empresa",
        foreign_keys="Campaign.empresa_id",
        cascade="all, delete-orphan"
    )
    
    campaigns_received: Mapped[list["Campaign"]] = relationship(
        "Campaign",
        back_populates="influencer",
        foreign_keys="Campaign.influencer_id"
    )
    
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    messages_sent: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="sender",
        foreign_keys="Message.sender_id"
    )
    
    messages_received: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="receiver",
        foreign_keys="Message.receiver_id"
    )
    
    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
