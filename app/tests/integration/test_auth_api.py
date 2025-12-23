"""
Integration tests for authentication API endpoints.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserRole


@pytest.mark.integration
class TestAuthAPI:
    """Integration tests for authentication endpoints."""
    
    @pytest.mark.asyncio
    async def test_user_registration(
        self,
        client: AsyncClient,
        db_session: AsyncSession
    ):
        """Test user registration endpoint."""
        user_data = {
            "email": "newuser@test.com",
            "password": "securepassword123",
            "full_name": "New Test User",
            "role": "EMPRESA"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert data["role"] == user_data["role"]
        assert "id" in data
        assert "hashed_password" not in data  # Password should not be returned
    
    @pytest.mark.asyncio
    async def test_empresa_registration_starts_trial(
        self,
        client: AsyncClient,
        db_session: AsyncSession
    ):
        """Test that EMPRESA registration automatically starts trial."""
        user_data = {
            "email": "empresa_trial@test.com",
            "password": "securepassword123",
            "full_name": "Empresa Trial User",
            "role": "EMPRESA"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "EMPRESA"
        assert data["is_approved"] is True
        assert data["trial_start_time"] is not None
        assert data["has_active_subscription"] is False
    
    @pytest.mark.asyncio
    async def test_influencer_registration_requires_approval(
        self,
        client: AsyncClient,
        db_session: AsyncSession
    ):
        """Test that INFLUENCER registration requires admin approval."""
        user_data = {
            "email": "influencer_new@test.com",
            "password": "securepassword123",
            "full_name": "New Influencer",
            "role": "INFLUENCER"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "INFLUENCER"
        assert data["is_approved"] is False
    
    @pytest.mark.asyncio
    async def test_duplicate_email_registration(
        self,
        client: AsyncClient,
        db_session: AsyncSession
    ):
        """Test that duplicate email registration is rejected."""
        user_data = {
            "email": "duplicate@test.com",
            "password": "securepassword123",
            "full_name": "Duplicate User",
            "role": "EMPRESA"
        }
        
        # First registration
        response1 = await client.post("/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Second registration with same email
        response2 = await client.post("/auth/register", json=user_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_user_login(
        self,
        client: AsyncClient,
        empresa_user
    ):
        """Test user login endpoint."""
        login_data = {
            "email": "empresa@test.com",
            "password": "password123"
        }
        
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_login_with_wrong_password(
        self,
        client: AsyncClient,
        empresa_user
    ):
        """Test login with incorrect password."""
        login_data = {
            "email": "empresa@test.com",
            "password": "wrongpassword"
        }
        
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_with_nonexistent_email(
        self,
        client: AsyncClient
    ):
        """Test login with non-existent email."""
        login_data = {
            "email": "nonexistent@test.com",
            "password": "password123"
        }
        
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_invalid_email_format(
        self,
        client: AsyncClient
    ):
        """Test registration with invalid email format."""
        user_data = {
            "email": "invalid-email",
            "password": "securepassword123",
            "full_name": "Invalid Email User",
            "role": "EMPRESA"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_short_password(
        self,
        client: AsyncClient
    ):
        """Test registration with password too short."""
        user_data = {
            "email": "shortpass@test.com",
            "password": "short",
            "full_name": "Short Password User",
            "role": "EMPRESA"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 422  # Validation error
