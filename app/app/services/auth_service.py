"""
Authentication service for user registration and login.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user_schemas import UserCreate, UserLogin


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def register_user(self, user_data: UserCreate) -> User:
        """
        Register a new user.
        
        Business Rules:
        - EMPRESA users start with trial_start_time set to now
        - INFLUENCER users require admin approval (is_approved=False)
        - ADMIN users are pre-approved
        """
        # Check if email already exists
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user instance
        user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            role=user_data.role,
            is_active=True,
        )
        
        # Apply role-specific logic
        if user_data.role == UserRole.EMPRESA:
            # Start trial immediately
            user.trial_start_time = datetime.now(timezone.utc)
            user.is_approved = True  # Empresas are auto-approved
        elif user_data.role == UserRole.INFLUENCER:
            # Requires admin approval
            user.is_approved = False
        elif user_data.role == UserRole.ADMIN:
            # Admins are auto-approved
            user.is_approved = True
        
        # Save to database
        user = await self.user_repo.create(user)
        
        return user
    
    async def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """
        Authenticate user with email and password.
        
        Returns:
            User if authentication successful, None otherwise
        """
        user = await self.user_repo.get_by_email(login_data.email)
        
        if not user:
            return None
        
        if not verify_password(login_data.password, user.hashed_password):
            return None
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        if not user.is_approved:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account pending approval"
            )
        
        return user
    
    def create_token(self, user: User) -> str:
        """
        Create JWT access token for authenticated user.
        """
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
        
        access_token = create_access_token(token_data)
        return access_token
    
    async def get_current_user(self, user_id: int) -> User:
        """
        Get current authenticated user by ID.
        """
        user = await self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        return user
