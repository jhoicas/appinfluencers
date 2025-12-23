"""
Script to initialize the database with initial data.
Run this after migrations to create initial admin user.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app module
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole


async def create_admin_user():
    """Create initial admin user if it doesn't exist."""
    async with AsyncSessionLocal() as session:
        # Check if admin exists
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.email == "admin@influencers.com")
        )
        existing_admin = result.scalar_one_or_none()
        
        if existing_admin:
            print("✅ Admin user already exists")
            return
        
        # Create admin user
        admin = User(
            email="admin@influencers.com",
            hashed_password=get_password_hash("admin123"),  # Change in production!
            full_name="Platform Administrator",
            role=UserRole.ADMIN,
            is_active=True,
            is_approved=True,
        )
        
        session.add(admin)
        await session.commit()
        
        print("✅ Admin user created successfully")
        print("   Email: admin@influencers.com")
        print("   Password: admin123")
        print("   ⚠️  CHANGE PASSWORD IN PRODUCTION!")


async def main():
    """Main initialization function."""
    print("🚀 Initializing database...")
    await create_admin_user()
    print("✅ Database initialization complete!")


if __name__ == "__main__":
    asyncio.run(main())
