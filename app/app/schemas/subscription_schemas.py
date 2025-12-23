"""
Schemas for subscription plans.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class SubscriptionPlanBase(BaseModel):
    name: str = Field(..., description="Plan name")
    description: str = Field(..., description="Plan description")
    price: Optional[float] = Field(None, description="Price in dollars, null for custom")
    price_display: str = Field(..., description="Display price, e.g., '$99' or 'Personalizado'")
    billing_period: str = Field(..., description="Billing period: monthly, yearly, custom")
    features: List[str] = Field(..., description="List of plan features")
    is_featured: bool = Field(False, description="Whether this plan is highlighted")
    is_active: bool = Field(True, description="Whether this plan can be purchased")
    display_order: int = Field(0, description="Display order (lower = first)")


class SubscriptionPlanCreate(SubscriptionPlanBase):
    """Schema for creating a new subscription plan."""
    pass


class SubscriptionPlanUpdate(BaseModel):
    """Schema for updating a subscription plan."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_display: Optional[str] = None
    billing_period: Optional[str] = None
    features: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class SubscriptionPlanResponse(SubscriptionPlanBase):
    """Schema for subscription plan response."""
    id: int

    class Config:
        from_attributes = True
