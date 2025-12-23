"""
Pytest configuration and fixtures for testing.
"""
import asyncio
from typing import AsyncGenerator, Generator
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from httpx import AsyncClient

from app.core.database import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.profile import InfluencerProfile

# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session() as session:
        yield session


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test HTTP client."""
    
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
async def empresa_user(db_session: AsyncSession) -> User:
    """Create a test EMPRESA user."""
    from datetime import datetime
    
    user = User(
        email="empresa@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Empresa",
        role=UserRole.EMPRESA,
        is_active=True,
        is_approved=True,
        trial_start_time=datetime.utcnow(),
        has_active_subscription=False,
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture
async def empresa_user_with_subscription(db_session: AsyncSession) -> User:
    """Create a test EMPRESA user with active subscription."""
    from datetime import datetime
    
    user = User(
        email="empresa_sub@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Empresa with Subscription",
        role=UserRole.EMPRESA,
        is_active=True,
        is_approved=True,
        trial_start_time=datetime.utcnow(),
        has_active_subscription=True,
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture
async def influencer_user(db_session: AsyncSession) -> User:
    """Create a test INFLUENCER user."""
    user = User(
        email="influencer@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Influencer",
        role=UserRole.INFLUENCER,
        is_active=True,
        is_approved=True,
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user


@pytest.fixture
async def influencer_profile(db_session: AsyncSession, influencer_user: User) -> InfluencerProfile:
    """Create a test influencer profile."""
    profile = InfluencerProfile(
        user_id=influencer_user.id,
        bio="Test influencer bio",
        instagram_handle="@testinfluencer",
        instagram_followers=10000,
        suggested_rate_per_post=500.0,
    )
    
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)
    
    return profile


@pytest.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create a test ADMIN user."""
    user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Admin",
        role=UserRole.ADMIN,
        is_active=True,
        is_approved=True,
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    return user
