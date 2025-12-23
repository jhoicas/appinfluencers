"""
Repository for Transaction model operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import List, Optional

from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.schemas.transaction_schemas import TransactionCreate, TransactionUpdate


class TransactionRepository:
    """Repository for transaction database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, transaction_data: TransactionCreate) -> Transaction:
        """Create a new transaction."""
        transaction = Transaction(**transaction_data.model_dump())
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
    
    async def get_by_id(self, transaction_id: int) -> Optional[Transaction]:
        """Get transaction by ID."""
        result = await self.db.execute(
            select(Transaction)
            .options(joinedload(Transaction.user))
            .where(Transaction.id == transaction_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TransactionStatus] = None
    ) -> List[Transaction]:
        """Get all transactions with optional status filter."""
        query = select(Transaction).options(joinedload(Transaction.user))
        
        if status:
            query = query.where(Transaction.status == status)
        
        query = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_by_user_id(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """Get all transactions for a specific user."""
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update(
        self,
        transaction_id: int,
        transaction_data: TransactionUpdate
    ) -> Optional[Transaction]:
        """Update a transaction."""
        transaction = await self.get_by_id(transaction_id)
        if not transaction:
            return None
        
        update_data = transaction_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transaction, field, value)
        
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
    
    async def get_stats(self) -> dict:
        """Get transaction statistics."""
        # Total revenue (completed transactions)
        revenue_result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .where(Transaction.status == TransactionStatus.COMPLETED)
        )
        total_revenue = revenue_result.scalar()
        
        # Pending amount
        pending_result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .where(Transaction.status == TransactionStatus.PENDING)
        )
        pending_amount = pending_result.scalar()
        
        # Count by status
        total_result = await self.db.execute(select(func.count(Transaction.id)))
        total_transactions = total_result.scalar()
        
        completed_result = await self.db.execute(
            select(func.count(Transaction.id))
            .where(Transaction.status == TransactionStatus.COMPLETED)
        )
        completed_transactions = completed_result.scalar()
        
        pending_count_result = await self.db.execute(
            select(func.count(Transaction.id))
            .where(Transaction.status == TransactionStatus.PENDING)
        )
        pending_transactions = pending_count_result.scalar()
        
        failed_result = await self.db.execute(
            select(func.count(Transaction.id))
            .where(Transaction.status == TransactionStatus.FAILED)
        )
        failed_transactions = failed_result.scalar()
        
        return {
            "total_revenue": float(total_revenue),
            "pending_amount": float(pending_amount),
            "total_transactions": total_transactions,
            "completed_transactions": completed_transactions,
            "pending_transactions": pending_transactions,
            "failed_transactions": failed_transactions,
        }
