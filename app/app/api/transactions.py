"""
Transaction API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.transaction import TransactionStatus
from app.api.dependencies import get_current_user, get_current_admin_user
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction_schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionWithUserResponse,
    TransactionStats
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/stats", response_model=TransactionStats)
async def get_transaction_stats(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get transaction statistics (Admin only).
    """
    transaction_repo = TransactionRepository(db)
    stats = await transaction_repo.get_stats()
    return stats


@router.get("/", response_model=List[TransactionWithUserResponse])
async def list_transactions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TransactionStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List transactions.
    - Admin: See all transactions
    - Other users: See only their own transactions
    """
    transaction_repo = TransactionRepository(db)
    
    if current_user.role == UserRole.ADMIN:
        # Admin can see all transactions
        transactions = await transaction_repo.get_all(skip=skip, limit=limit, status=status)
    else:
        # Users can only see their own transactions
        transactions = await transaction_repo.get_by_user_id(
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        if status:
            transactions = [t for t in transactions if t.status == status]
    
    # Convert to response with user info
    result = []
    for transaction in transactions:
        transaction_dict = {
            "id": transaction.id,
            "user_id": transaction.user_id,
            "amount": transaction.amount,
            "type": transaction.type,
            "status": transaction.status,
            "description": transaction.description,
            "payment_method": transaction.payment_method,
            "transaction_reference": transaction.transaction_reference,
            "created_at": transaction.created_at,
            "updated_at": transaction.updated_at,
            "user_name": transaction.user.full_name,
            "user_email": transaction.user.email,
        }
        result.append(transaction_dict)
    
    return result


@router.get("/me", response_model=List[TransactionResponse])
async def get_my_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's transactions.
    """
    transaction_repo = TransactionRepository(db)
    transactions = await transaction_repo.get_by_user_id(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return transactions


@router.get("/{transaction_id}", response_model=TransactionWithUserResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific transaction.
    - Admin: Can see any transaction
    - Other users: Can only see their own transactions
    """
    transaction_repo = TransactionRepository(db)
    transaction = await transaction_repo.get_by_id(transaction_id)
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and transaction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this transaction"
        )
    
    return {
        "id": transaction.id,
        "user_id": transaction.user_id,
        "amount": transaction.amount,
        "type": transaction.type,
        "status": transaction.status,
        "description": transaction.description,
        "payment_method": transaction.payment_method,
        "transaction_reference": transaction.transaction_reference,
        "created_at": transaction.created_at,
        "updated_at": transaction.updated_at,
        "user_name": transaction.user.full_name,
        "user_email": transaction.user.email,
    }


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new transaction (Admin only).
    """
    transaction_repo = TransactionRepository(db)
    transaction = await transaction_repo.create(transaction_data)
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a transaction (Admin only).
    """
    transaction_repo = TransactionRepository(db)
    transaction = await transaction_repo.update(transaction_id, transaction_data)
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction
