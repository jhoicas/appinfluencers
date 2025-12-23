"""
Script para poblar la base de datos con datos de prueba.
Crea usuarios de ejemplo: Admin, Empresa Premium, e Influencer con métricas.
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.profile import InfluencerProfile
from app.models.campaign import Campaign, CampaignStatus
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.subscription_plan import SubscriptionPlan
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.notification import Notification
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_tables():
    """Crear todas las tablas en la base de datos."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tablas creadas")


async def seed_database():
    """Poblar la base de datos con datos de prueba."""
    async with AsyncSessionLocal() as db:
        try:
            # 1. Crear Admin
            admin = User(
                email="admin@influencers.com",
                hashed_password=pwd_context.hash("admin123"),
                full_name="Administrador Principal",
                role=UserRole.ADMIN,
                is_approved=True,
                is_active=True
            )
            db.add(admin)
            print("✅ Admin creado: admin@influencers.com / admin123")

            # 2. Crear Empresa Premium
            empresa = User(
                email="empresa@test.com",
                hashed_password=pwd_context.hash("empresa123"),
                full_name="Empresa Demo S.A.",
                role=UserRole.EMPRESA,
                is_approved=True,
                is_active=True,
                trial_start_time=datetime.utcnow() - timedelta(days=30),  # Trial expirado
                has_active_subscription=True
            )
            db.add(empresa)
            print("✅ Empresa creada: empresa@test.com / empresa123")

            # 3. Crear Influencer
            influencer = User(
                email="influencer@test.com",
                hashed_password=pwd_context.hash("influencer123"),
                full_name="María Influencer",
                role=UserRole.INFLUENCER,
                is_approved=True,
                is_active=True
            )
            db.add(influencer)
            print("✅ Influencer creado: influencer@test.com / influencer123")

            await db.flush()  # Para obtener los IDs

            # 4. Crear Plan de Suscripción Premium
            plan_premium = SubscriptionPlan(
                name="Plan Premium",
                description="Acceso completo a todas las funcionalidades",
                price=99.99,
                duration_days=30,
                features={
                    "campaigns_limit": None,  # Ilimitado
                    "advanced_analytics": True,
                    "priority_support": True,
                    "custom_branding": True
                },
                is_active=True
            )
            db.add(plan_premium)
            await db.flush()

            # 5. Crear Suscripción Activa para la Empresa
            subscription = Subscription(
                user_id=empresa.id,
                plan_id=plan_premium.id,
                status=SubscriptionStatus.ACTIVE,
                start_date=datetime.utcnow() - timedelta(days=15),
                end_date=datetime.utcnow() + timedelta(days=15),
                auto_renew=True
            )
            db.add(subscription)
            print("✅ Suscripción Premium activa para empresa")

            # 6. Crear Transacción de Pago
            transaction = Transaction(
                user_id=empresa.id,
                subscription_id=subscription.id,
                amount=99.99,
                transaction_type=TransactionType.SUBSCRIPTION,
                status=TransactionStatus.COMPLETED,
                description="Pago Plan Premium - Mes 1",
                payment_method="credit_card",
                metadata={"card_last4": "4242", "brand": "visa"}
            )
            db.add(transaction)

            # 7. Crear Perfil de Influencer con Métricas
            profile = InfluencerProfile(
                user_id=influencer.id,
                bio="Creadora de contenido especializada en lifestyle y tecnología. 🎥✨",
                profile_picture_url="https://i.pravatar.cc/300?img=47",
                
                # TikTok
                tiktok_handle="@maria_influencer",
                tiktok_followers=125000,
                tiktok_insights={
                    "avg_views": 50000,
                    "avg_likes": 5000,
                    "avg_comments": 250,
                    "avg_shares": 150,
                    "engagement_rate": 4.2,
                    "top_content": ["lifestyle", "tech", "fashion"]
                },
                
                # YouTube
                youtube_handle="@MariaInfluencer",
                youtube_subscribers=45000,
                
                # Engagement
                average_engagement_rate=4.5,
                
                # Tarifas sugeridas
                suggested_rate_per_post=500.00,
                suggested_rate_per_story=200.00,
                suggested_rate_per_video=1000.00,
                
                # Categorías
                categories={
                    "primary": "Lifestyle",
                    "secondary": ["Tecnología", "Moda", "Viajes"],
                    "interests": ["Fotografía", "Diseño", "Emprendimiento"]
                },
                
                # Portfolio
                portfolio_items={
                    "campaigns": [
                        {
                            "brand": "TechBrand",
                            "description": "Campaña de lanzamiento smartphone",
                            "reach": 150000,
                            "engagement": 6500
                        },
                        {
                            "brand": "FashionCo",
                            "description": "Colección primavera-verano",
                            "reach": 200000,
                            "engagement": 8500
                        }
                    ],
                    "highlights": [
                        "Top 10 Influencers Tech 2024",
                        "Colaboración con marcas internacionales",
                        "Más de 1M de impresiones mensuales"
                    ]
                },
                
                total_campaigns_completed=12,
                average_rating=4.8
            )
            db.add(profile)
            print("✅ Perfil de influencer creado con métricas completas")

            # 8. Crear Campañas
            # Campaña Completada
            campaign1 = Campaign(
                title="Lanzamiento Producto Tech",
                description="Campaña para promocionar el nuevo smartphone XYZ. Incluye unboxing, review y contenido lifestyle.",
                empresa_id=empresa.id,
                influencer_id=influencer.id,
                budget=1500.00,
                start_date=datetime.utcnow() - timedelta(days=45),
                end_date=datetime.utcnow() - timedelta(days=15),
                status=CampaignStatus.COMPLETED,
                requirements={
                    "deliverables": [
                        "1 video TikTok (60s)",
                        "3 historias Instagram",
                        "1 post feed Instagram"
                    ],
                    "hashtags": ["#TechXYZ", "#Innovation", "#Smartphone"],
                    "mentions": ["@TechXYZ"],
                    "content_guidelines": "Tono casual y auténtico, mostrar características principales"
                },
                deliverables={
                    "completed": [
                        {
                            "type": "TikTok Video",
                            "url": "https://tiktok.com/@maria_influencer/video/123",
                            "views": 85000,
                            "likes": 7200,
                            "comments": 340
                        },
                        {
                            "type": "Instagram Stories",
                            "views": 45000,
                            "interactions": 2100
                        },
                        {
                            "type": "Instagram Post",
                            "url": "https://instagram.com/p/ABC123",
                            "likes": 8500,
                            "comments": 420
                        }
                    ],
                    "total_reach": 130000,
                    "total_engagement": 18560
                }
            )
            db.add(campaign1)

            # Campaña En Progreso
            campaign2 = Campaign(
                title="Colección Moda Verano",
                description="Promoción de nueva colección de ropa de verano. Contenido lifestyle y fashion.",
                empresa_id=empresa.id,
                influencer_id=influencer.id,
                budget=2000.00,
                start_date=datetime.utcnow() - timedelta(days=5),
                end_date=datetime.utcnow() + timedelta(days=25),
                status=CampaignStatus.IN_PROGRESS,
                requirements={
                    "deliverables": [
                        "2 videos TikTok",
                        "5 historias Instagram",
                        "2 posts feed Instagram",
                        "1 Reel Instagram"
                    ],
                    "hashtags": ["#SummerFashion", "#FashionCo", "#OOTD"],
                    "mentions": ["@FashionCo"],
                    "content_guidelines": "Mostrar diferentes looks, ambiente veraniego, natural light"
                },
                deliverables={
                    "completed": [
                        {
                            "type": "TikTok Video",
                            "url": "https://tiktok.com/@maria_influencer/video/456",
                            "views": 62000,
                            "likes": 5100,
                            "comments": 280
                        }
                    ],
                    "pending": ["1 TikTok Video", "5 Stories", "2 Posts", "1 Reel"]
                }
            )
            db.add(campaign2)

            # Campaña Pendiente
            campaign3 = Campaign(
                title="Promoción App Fitness",
                description="Campaña para promocionar nueva app de fitness y bienestar.",
                empresa_id=empresa.id,
                influencer_id=influencer.id,
                budget=1200.00,
                start_date=datetime.utcnow() + timedelta(days=7),
                end_date=datetime.utcnow() + timedelta(days=37),
                status=CampaignStatus.PENDING,
                requirements={
                    "deliverables": [
                        "3 videos TikTok mostrando rutinas",
                        "1 video YouTube (5-7 min)",
                        "Stories diarias por 1 semana"
                    ],
                    "hashtags": ["#FitnessApp", "#Wellness", "#HealthyLife"],
                    "mentions": ["@FitnessApp"],
                    "content_guidelines": "Contenido motivacional, mostrar uso real de la app"
                }
            )
            db.add(campaign3)
            print("✅ 3 campañas creadas (Completada, En Progreso, Pendiente)")

            # 9. Crear Notificaciones
            notif1 = Notification(
                user_id=influencer.id,
                title="¡Campaña completada con éxito!",
                message="La campaña 'Lanzamiento Producto Tech' ha sido marcada como completada. Excelente trabajo! 🎉",
                type="campaign_completed",
                is_read=True
            )
            db.add(notif1)

            notif2 = Notification(
                user_id=influencer.id,
                title="Nueva campaña asignada",
                message="Has sido seleccionada para la campaña 'Colección Moda Verano'. Revisa los detalles.",
                type="campaign_assigned",
                is_read=False
            )
            db.add(notif2)

            notif3 = Notification(
                user_id=empresa.id,
                title="Pago procesado exitosamente",
                message="Tu suscripción Premium ha sido renovada. Gracias por confiar en nosotros! 💳",
                type="payment_success",
                is_read=True
            )
            db.add(notif3)

            notif4 = Notification(
                user_id=empresa.id,
                title="Campaña en progreso",
                message="La campaña 'Colección Moda Verano' está en progreso. El influencer ha completado 1 de 10 entregables.",
                type="campaign_update",
                is_read=False
            )
            db.add(notif4)
            print("✅ Notificaciones creadas")

            # Commit de todos los cambios
            await db.commit()
            print("\n" + "="*50)
            print("🎉 Base de datos poblada exitosamente!")
            print("="*50)
            print("\n📋 CREDENCIALES DE ACCESO:")
            print("\n👤 Admin:")
            print("   Email: admin@influencers.com")
            print("   Password: admin123")
            print("\n🏢 Empresa (Premium):")
            print("   Email: empresa@test.com")
            print("   Password: empresa123")
            print("   Suscripción: Premium activa")
            print("\n⭐ Influencer:")
            print("   Email: influencer@test.com")
            print("   Password: influencer123")
            print("   Seguidores TikTok: 125,000")
            print("   Campañas completadas: 12")
            print("   Rating: 4.8/5")
            print("\n" + "="*50)

        except Exception as e:
            await db.rollback()
            print(f"❌ Error al poblar la base de datos: {e}")
            raise


async def main():
    """Función principal."""
    print("🚀 Iniciando seed de base de datos...")
    print("="*50)
    
    # Crear tablas
    await create_tables()
    
    # Poblar datos
    await seed_database()


if __name__ == "__main__":
    asyncio.run(main())
