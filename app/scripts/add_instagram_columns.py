"""
Script to add Instagram columns to influencer_profiles table.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def add_instagram_columns():
    # Create engine
    engine = create_async_engine(
        "mysql+aiomysql://root:1234@host.docker.internal:3306/db_appinfluencers",
        echo=True
    )
    
    async with engine.begin() as conn:
        # Check if columns exist
        result = await conn.execute(text("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'db_appinfluencers' 
            AND TABLE_NAME = 'influencer_profiles' 
            AND COLUMN_NAME = 'instagram_handle'
        """))
        row = result.fetchone()
        exists = row[0] > 0
        
        if not exists:
            print("Adding instagram_handle column...")
            await conn.execute(text("""
                ALTER TABLE influencer_profiles 
                ADD COLUMN instagram_handle VARCHAR(100) NULL AFTER profile_picture_url
            """))
            
            print("Adding instagram_followers column...")
            await conn.execute(text("""
                ALTER TABLE influencer_profiles 
                ADD COLUMN instagram_followers INT NULL AFTER instagram_handle
            """))
            print("✅ Instagram columns added successfully!")
        else:
            print("✅ Instagram columns already exist!")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_instagram_columns())
