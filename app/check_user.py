import asyncio
from app.repositories.user_repository import UserRepository
from app.core.database import get_db
from app.core.security import verify_password

async def check_user():
    async for db in get_db():
        repo = UserRepository(db)
        user = await repo.get_by_email('empresa@test.com')
        
        if user:
            print(f"✅ Usuario encontrado:")
            print(f"  Email: {user.email}")
            print(f"  Nombre: {user.full_name}")
            print(f"  Rol: {user.role}")
            print(f"  Activo: {user.is_active}")
            print(f"  Aprobado: {user.is_approved}")
            print(f"  Hash (primeros 30 chars): {user.hashed_password[:30]}...")
            
            # Probar la contraseña
            for pwd in ['password123', 'empresa123', 'admin123']:
                is_valid = verify_password(pwd, user.hashed_password)
                print(f"🔐 Verificación de contraseña '{pwd}': {is_valid}")
        else:
            print("❌ Usuario no encontrado")
        
        break

if __name__ == "__main__":
    asyncio.run(check_user())
