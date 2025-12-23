"""
Script to seed social media insights into influencer profiles.
"""
import asyncio
import sys
from pathlib import Path
import random

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.profile import InfluencerProfile
from sqlalchemy import select


def generate_instagram_insights(followers: int):
    """Generate realistic Instagram insights based on follower count."""
    engagement_rate = random.uniform(2.5, 8.5)  # 2.5% - 8.5%
    avg_likes = int(followers * (engagement_rate / 100))
    avg_comments = int(avg_likes * random.uniform(0.05, 0.15))  # 5-15% of likes
    
    return {
        "followers": followers,
        "following": random.randint(100, 1000),
        "posts_count": random.randint(50, 500),
        "engagement_rate": round(engagement_rate, 2),
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "reach": int(followers * random.uniform(0.3, 0.7)),  # 30-70% reach
        "impressions": int(followers * random.uniform(0.5, 1.5)),  # 50-150% impressions
        "profile_views": int(followers * random.uniform(0.1, 0.3)),  # 10-30% profile views
        "website_clicks": random.randint(50, 500),
        "top_posts": [
            {
                "id": f"post_{i}",
                "likes": int(avg_likes * random.uniform(1.2, 3.0)),
                "comments": int(avg_comments * random.uniform(1.2, 3.0)),
                "image_url": f"https://picsum.photos/400/400?random={i}"
            }
            for i in range(1, 4)
        ]
    }


def generate_tiktok_insights(followers: int):
    """Generate realistic TikTok insights based on follower count."""
    engagement_rate = random.uniform(5.0, 15.0)  # TikTok has higher engagement
    total_videos = random.randint(20, 200)
    avg_views = int(followers * random.uniform(0.5, 2.0))  # 50-200% of followers
    avg_likes = int(avg_views * (engagement_rate / 100))
    avg_comments = int(avg_likes * random.uniform(0.03, 0.10))
    avg_shares = int(avg_likes * random.uniform(0.05, 0.15))
    
    return {
        "followers": followers,
        "following": random.randint(50, 500),
        "total_likes": avg_likes * total_videos,
        "total_videos": total_videos,
        "avg_views": avg_views,
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "avg_shares": avg_shares,
        "engagement_rate": round(engagement_rate, 2),
        "video_views": avg_views * total_videos,
        "profile_views": int(followers * random.uniform(0.2, 0.5)),
        "top_videos": [
            {
                "id": f"video_{i}",
                "views": int(avg_views * random.uniform(1.5, 5.0)),
                "likes": int(avg_likes * random.uniform(1.5, 5.0)),
                "comments": int(avg_comments * random.uniform(1.5, 5.0)),
                "shares": int(avg_shares * random.uniform(1.5, 5.0)),
                "thumbnail_url": f"https://picsum.photos/300/533?random={i+10}"
            }
            for i in range(1, 4)
        ]
    }


async def seed_insights():
    """Seed insights for all influencer profiles."""
    async with AsyncSessionLocal() as db:
        try:
            # Get all influencer profiles
            result = await db.execute(select(InfluencerProfile))
            profiles = list(result.scalars().all())
            
            if not profiles:
                print("❌ No influencer profiles found.")
                return
            
            print(f"✅ Found {len(profiles)} influencer profiles")
            
            updated_count = 0
            for profile in profiles:
                # Generate insights if they have social media handles
                if profile.instagram_handle and profile.instagram_followers:
                    profile.instagram_insights = generate_instagram_insights(profile.instagram_followers)
                    print(f"   📸 Generated Instagram insights for profile {profile.id}")
                
                if profile.tiktok_handle and profile.tiktok_followers:
                    profile.tiktok_insights = generate_tiktok_insights(profile.tiktok_followers)
                    print(f"   🎵 Generated TikTok insights for profile {profile.id}")
                
                updated_count += 1
            
            await db.commit()
            
            print(f"\n✅ Successfully updated {updated_count} profiles with insights!")
            
        except Exception as e:
            print(f"❌ Error seeding insights: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("🚀 Seeding social media insights...")
    asyncio.run(seed_insights())
    print("✅ Done!")
