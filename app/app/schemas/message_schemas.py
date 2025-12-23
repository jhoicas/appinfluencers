"""
Pydantic schemas for messages.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MessageCreate(BaseModel):
    """Schema for creating a message."""
    campaign_id: int
    receiver_id: int
    content: str = Field(..., min_length=1)
    attachment_url: Optional[str] = None


class MessageResponse(BaseModel):
    """Schema for message response."""
    id: int
    campaign_id: int
    sender_id: int
    receiver_id: int
    content: str
    attachment_url: Optional[str] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
