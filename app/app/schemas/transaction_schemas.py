"""
Pydantic schemas for Transaction model.
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

from app.models.transaction import TransactionType, TransactionStatus


class TransactionBase(BaseModel):
    """Base transaction schema."""
    amount: float
    type: TransactionType
    description: str
    payment_method: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    user_id: int
    status: TransactionStatus = TransactionStatus.PENDING
    transaction_reference: Optional[str] = None


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    status: Optional[TransactionStatus] = None
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    id: int
    user_id: int
    status: TransactionStatus
    transaction_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TransactionWithUserResponse(TransactionResponse):
    """Schema for transaction response with user info."""
    user_name: str
    user_email: str
    
    model_config = ConfigDict(from_attributes=True)


class TransactionStats(BaseModel):
    """Schema for transaction statistics."""
    total_revenue: float
    pending_amount: float
    total_transactions: int
    completed_transactions: int
    pending_transactions: int
    failed_transactions: int
