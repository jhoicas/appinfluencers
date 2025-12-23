import asyncio
from app.repositories.user_repository import UserRepository
from app.core.database import get_db
from app.core.security import get_password_hash

async def reset_passwords():
    async for db in get_db():
        repo = UserRepository(db)
        
        # Actualizar contraseña de empresa@test.com
        empresa_user = await repo.get_by_email('empresa@test.com')
        if empresa_user:
            empresa_user.hashed_password = get_password_hash('password123')
            await db.commit()
            print(f"✅ Contraseña actualizada para: {empresa_user.email}")
        
        # Actualizar contraseña de gaby@influencer.com
        influencer_user = await repo.get_by_email('gaby@influencer.com')
        if influencer_user:
            influencer_user.hashed_password = get_password_hash('password123')
            await db.commit()
            print(f"✅ Contraseña actualizada para: {influencer_user.email}")
        
        # Actualizar todas las contraseñas a password123
        all_users = await repo.get_all()
        for user in all_users:
            user.hashed_password = get_password_hash('password123')
        await db.commit()
        print(f"\n✅ Se actualizaron {len(all_users)} usuarios con contraseña 'password123'")
        
        break

if __name__ == "__main__":
    asyncio.run(reset_passwords())
