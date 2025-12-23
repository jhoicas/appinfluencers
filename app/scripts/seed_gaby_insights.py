"""
Script to add comprehensive test insights to gaby@gmail.com influencer profile.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.profile import InfluencerProfile
from sqlalchemy import select


async def seed_gaby_insights():
    """Add detailed test insights to gaby@gmail.com profile."""
    async with AsyncSessionLocal() as db:
        try:
            # Find user by email
            result = await db.execute(
                select(User).where(User.email == "gaby@gmail.com")
            )
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ Usuario gaby@gmail.com no encontrado.")
                print("   Creando usuario...")
                
                # Create user if doesn't exist
                from app.models.user import UserRole
                from passlib.context import CryptContext
                
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                
                user = User(
                    email="gaby@gmail.com",
                    hashed_password=pwd_context.hash("gaby123"),
                    full_name="Gabriela Influencer",
                    role=UserRole.INFLUENCER,
                    is_active=True
                )
                db.add(user)
                await db.flush()
                print(f"✅ Usuario creado: {user.email}")
            
            # Check if profile exists
            profile_result = await db.execute(
                select(InfluencerProfile).where(InfluencerProfile.user_id == user.id)
            )
            profile = profile_result.scalar_one_or_none()
            
            if not profile:
                print("   Creando perfil de influencer...")
                
                profile = InfluencerProfile(
                    user_id=user.id,
                    bio="Influencer de moda y lifestyle. Creadora de contenido apasionada por compartir tendencias y estilo de vida.",
                    instagram_handle="gaby_lifestyle",
                    instagram_followers=85000,
                    tiktok_handle="gabylifestyle",
                    tiktok_followers=120000,
                    youtube_handle="GabyLifestyle",
                    youtube_subscribers=45000,
                    average_engagement_rate=6.5,
                    suggested_rate_per_post=500.00,
                    suggested_rate_per_story=200.00,
                    suggested_rate_per_video=800.00,
                    categories=["Moda", "Belleza", "Lifestyle"],
                    total_campaigns_completed=12,
                    average_rating=4.8
                )
                db.add(profile)
                await db.flush()
                print(f"✅ Perfil creado para {user.email}")
            else:
                print(f"✅ Perfil existente encontrado para {user.email}")
            
            # Add comprehensive Instagram insights
            instagram_insights = {
                "followers": 85000,
                "following": 1250,
                "posts_count": 342,
                "engagement_rate": 6.52,
                "avg_likes": 5542,
                "avg_comments": 287,
                "reach": 62000,
                "impressions": 125000,
                "profile_views": 18500,
                "website_clicks": 1240,
                "top_posts": [
                    {
                        "id": "post_1",
                        "likes": 12500,
                        "comments": 645,
                        "image_url": "https://picsum.photos/400/400?random=101"
                    },
                    {
                        "id": "post_2",
                        "likes": 10800,
                        "comments": 523,
                        "image_url": "https://picsum.photos/400/400?random=102"
                    },
                    {
                        "id": "post_3",
                        "likes": 9650,
                        "comments": 478,
                        "image_url": "https://picsum.photos/400/400?random=103"
                    }
                ]
            }
            
            # Add comprehensive TikTok insights
            tiktok_insights = {
                "followers": 120000,
                "following": 450,
                "total_likes": 3500000,
                "total_videos": 156,
                "avg_views": 85000,
                "avg_likes": 6800,
                "avg_comments": 420,
                "avg_shares": 850,
                "engagement_rate": 9.5,
                "video_views": 13260000,
                "profile_views": 45000,
                "top_videos": [
                    {
                        "id": "video_1",
                        "views": 450000,
                        "likes": 38000,
                        "comments": 2100,
                        "shares": 5600,
                        "thumbnail_url": "https://picsum.photos/300/533?random=201"
                    },
                    {
                        "id": "video_2",
                        "views": 380000,
                        "likes": 32000,
                        "comments": 1850,
                        "shares": 4200,
                        "thumbnail_url": "https://picsum.photos/300/533?random=202"
                    },
                    {
                        "id": "video_3",
                        "views": 320000,
                        "likes": 28000,
                        "comments": 1600,
                        "shares": 3800,
                        "thumbnail_url": "https://picsum.photos/300/533?random=203"
                    }
                ]
            }
            
            # Update profile with insights
            profile.instagram_insights = instagram_insights
            profile.tiktok_insights = tiktok_insights
            profile.instagram_followers = 85000
            profile.tiktok_followers = 120000
            profile.average_engagement_rate = 6.52
            
            await db.commit()
            
            print("\n" + "="*60)
            print("✅ DATOS DE PRUEBA AGREGADOS EXITOSAMENTE")
            print("="*60)
            print(f"\n📧 Email: gaby@gmail.com")
            print(f"🔑 Password: gaby123")
            print(f"👤 Nombre: {user.full_name}")
            print(f"📊 Rol: {user.role}")
            print(f"\n📸 Instagram:")
            print(f"   - Handle: @{profile.instagram_handle}")
            print(f"   - Seguidores: {profile.instagram_followers:,}")
            print(f"   - Engagement: {instagram_insights['engagement_rate']}%")
            print(f"   - Posts: {instagram_insights['posts_count']}")
            print(f"\n🎵 TikTok:")
            print(f"   - Handle: @{profile.tiktok_handle}")
            print(f"   - Seguidores: {profile.tiktok_followers:,}")
            print(f"   - Engagement: {tiktok_insights['engagement_rate']}%")
            print(f"   - Videos: {tiktok_insights['total_videos']}")
            print(f"   - Likes Totales: {tiktok_insights['total_likes']:,}")
            print(f"\n💰 Tarifas:")
            print(f"   - Post: ${profile.suggested_rate_per_post}")
            print(f"   - Story: ${profile.suggested_rate_per_story}")
            print(f"   - Video: ${profile.suggested_rate_per_video}")
            print(f"\n⭐ Estadísticas:")
            print(f"   - Campañas completadas: {profile.total_campaigns_completed}")
            print(f"   - Rating promedio: {profile.average_rating}/5.0")
            print("\n" + "="*60)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("🚀 Agregando datos de prueba a gaby@gmail.com...")
    asyncio.run(seed_gaby_insights())
    print("\n✅ Proceso completado!")
