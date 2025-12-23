"""
Script to clear all mock/seeded data from the database
"""
import asyncio
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.models.campaign import Campaign
from app.models.profile import InfluencerProfile
from app.models.user import User, UserRole


async def clear_mock_data():
    """Clear all campaigns and influencer profiles (keeping users)"""
    async with AsyncSessionLocal() as db:
        # Delete all campaigns
        result_campaigns = await db.execute(delete(Campaign))
        campaigns_deleted = result_campaigns.rowcount
        
        # Delete all influencer profiles
        result_profiles = await db.execute(delete(InfluencerProfile))
        profiles_deleted = result_profiles.rowcount
        
        await db.commit()
        
        print(f"✅ Datos limpiados:")
        print(f"   - {campaigns_deleted} campañas eliminadas")
        print(f"   - {profiles_deleted} perfiles de influencer eliminados")
        print(f"   - Usuarios mantenidos intactos")


if __name__ == "__main__":
    print("🗑️  Limpiando datos mockeados...")
    asyncio.run(clear_mock_data())
    print("✨ Proceso completado")
