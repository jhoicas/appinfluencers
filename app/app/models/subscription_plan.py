"""
Subscription Plan model for managing pricing plans.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, JSON
from app.core.database import Base


class SubscriptionPlan(Base):
    """
    Model for subscription plans that can be purchased by EMPRESA users.
    Admin users can create and manage these plans.
    """
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=True)  # Null for custom pricing
    price_display = Column(String, nullable=False)  # e.g., "$99" or "Personalizado"
    billing_period = Column(String, nullable=False)  # "monthly", "yearly", "custom"
    features = Column(JSON, nullable=False)  # List of features
    is_featured = Column(Boolean, default=False)  # Highlighted plan
    is_active = Column(Boolean, default=True)  # Can be purchased
    display_order = Column(Integer, default=0)  # Order in which to display
    
    def __repr__(self):
        return f"<SubscriptionPlan {self.name}>"
