#!/bin/bash
# Production initialization script for Digital Ocean

set -e

echo "🚀 Starting production initialization..."

# Run database migrations
echo "📦 Running database migrations..."
alembic upgrade head

# Check if admin user exists, create if not
echo "👤 Checking for admin user..."
python3 <<EOF
import asyncio
from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def init_admin():
    async with async_session_maker() as db:
        # Check if admin exists
        result = await db.execute(
            select(User).where(User.role == UserRole.ADMIN)
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            print("Creating default admin user...")
            admin = User(
                email='admin@appinfluencers.com',
                hashed_password=get_password_hash('ChangeMe123!'),
                full_name='Admin User',
                role=UserRole.ADMIN,
                is_active=True,
                is_approved=True
            )
            db.add(admin)
            await db.commit()
            print("✅ Admin user created: admin@appinfluencers.com")
            print("⚠️  IMPORTANT: Change the password immediately!")
        else:
            print("✅ Admin user already exists")

asyncio.run(init_admin())
EOF

echo "✅ Initialization complete!"
echo "🌐 Starting API server..."
