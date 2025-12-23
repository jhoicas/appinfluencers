"""
Subscription model for empresa monthly subscriptions.
"""
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SubscriptionStatus(str, enum.Enum):
    """Subscription status enumeration."""
    ACTIVA = "ACTIVA"
    CANCELADA = "CANCELADA"
    EXPIRADA = "EXPIRADA"
    PENDIENTE_PAGO = "PENDIENTE_PAGO"


class Subscription(Base):
    """
    Subscription model for empresa users.
    Tracks monthly subscription payments and status.
    """
    __tablename__ = "subscriptions"
    
    # Primary Key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign Key
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Subscription Details
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    monthly_fee: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Status
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.ACTIVA,
        nullable=False,
        index=True
    )
    
    # Billing Period
    current_period_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    current_period_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscriptions")
    
    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, user_id={self.user_id}, status={self.status})>"
