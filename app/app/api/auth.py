"""
Authentication router for user registration and login.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.schemas.user_schemas import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    - **EMPRESA**: Automatically approved, trial starts immediately
    - **INFLUENCER**: Requires admin approval
    - **ADMIN**: Automatically approved
    """
    auth_service = AuthService(db)
    user = await auth_service.register_user(user_data)
    return user


@router.options("/login")
async def login_options():
    """Handle CORS preflight for login endpoint."""
    return {"message": "OK"}


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password.
    
    Sets httpOnly cookie with JWT token and returns token in response.
    """
    auth_service = AuthService(db)
    
    user = await auth_service.authenticate_user(login_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_token(user)
    
    # Set httpOnly cookie for frontend
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Cannot be accessed by JavaScript (XSS protection)
        secure=settings.ENVIRONMENT == "production",  # HTTPS only in production
        samesite="lax", # CSRF protection
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # seconds
    )
    
    return Token(access_token=access_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    response: Response,
    access_token: str = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token.
    
    Validates the current token and issues a new one if valid.
    Sets new httpOnly cookie and returns new token in response.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🔄 Refresh token called. Token present: {bool(access_token)}")
    
    if not access_token:
        logger.warning("❌ No token provided in refresh request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode and validate current token
    from app.core.security import decode_access_token
    payload = decode_access_token(access_token)
    if not payload:
        logger.warning("❌ Token decode failed or token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user_id_str = payload.get("sub")
    if not user_id_str:
        logger.warning("❌ No user ID in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        logger.warning("❌ Invalid user ID format in token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(user_id)
    if not user:
        logger.warning(f"❌ User {user_id} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new token
    new_access_token = auth_service.create_token(user)
    logger.info(f"✅ New token created for user {user_id}")
    
    # Set new httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return Token(access_token=new_access_token)


@router.post("/logout")
async def logout(response: Response):
    """
    Logout user by clearing the httpOnly cookie.
    """
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}
