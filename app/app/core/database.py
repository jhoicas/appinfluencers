"""
Async database configuration using SQLAlchemy 2.0.
Supports both PostgreSQL (default) and MySQL through configuration.
Uses asyncpg for PostgreSQL and aiomysql for MySQL.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Convert DATABASE_URL to async format based on database type
database_url = settings.DATABASE_URL

# Detect database type and convert to async driver
if database_url.startswith("mysql://"):
    # MySQL: Use aiomysql driver
    database_url = database_url.replace("mysql://", "mysql+aiomysql://", 1)
    db_type = "mysql"
elif database_url.startswith("postgresql://"):
    # PostgreSQL: Use asyncpg driver
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    db_type = "postgresql"
elif database_url.startswith("postgres://"):
    # PostgreSQL (short form): Use asyncpg driver
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    db_type = "postgresql"
elif database_url.startswith("postgresql+asyncpg://"):
    db_type = "postgresql"
elif database_url.startswith("mysql+aiomysql://"):
    db_type = "mysql"
else:
    raise ValueError(
        f"Unsupported DATABASE_URL: {database_url}. "
        "Must start with 'postgresql://', 'postgres://', or 'mysql://'"
    )

print(f"🗄️  Database Type: {db_type}")
print(f"📍 Database URL: {database_url.split('@')[1] if '@' in database_url else 'configured'}")

# Create async engine with database-specific settings
engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_recycle": 3600,  # Recycle connections every hour
}

# Database-specific connection arguments
if db_type == "mysql":
    engine_kwargs["connect_args"] = {
        "charset": "utf8mb4",  # Full support for special characters and emojis
    }
elif db_type == "postgresql":
    engine_kwargs["connect_args"] = {
        "server_settings": {
            "jit": "off",  # Disable JIT for better consistency
        }
    }

engine = create_async_engine(database_url, **engine_kwargs)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database sessions.
    
    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.
    Should only be used in development. Use Alembic for production.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

