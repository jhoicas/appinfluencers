"""
Auto-seed module que carga datos iniciales si la base de datos está vacía.
Se ejecuta automáticamente al iniciar la aplicación.
"""
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserRole
from app.models.profile import InfluencerProfile
from app.models.campaign import Campaign, CampaignStatus
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.subscription_plan import SubscriptionPlan
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.notification import Notification
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def check_if_seeded(db: AsyncSession) -> bool:
    """Verifica si la base de datos ya tiene datos."""
    result = await db.execute(select(User))
    users = result.scalars().all()
    return len(users) > 0


async def seed_initial_data(db: AsyncSession):
    """Carga datos iniciales en la base de datos."""
    try:
        # Verificar si ya hay datos
        if await check_if_seeded(db):
            print("ℹ️  Base de datos ya contiene datos, saltando seed...")
            return

        print("🌱 Iniciando seed de datos iniciales...")

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

        # 2. Crear Empresa Premium
        empresa = User(
            email="empresa@test.com",
            hashed_password=pwd_context.hash("empresa123"),
            full_name="Empresa Demo S.A.",
            role=UserRole.EMPRESA,
            is_approved=True,
            is_active=True,
            trial_start_time=datetime.utcnow() - timedelta(days=30),
            has_active_subscription=True
        )
        db.add(empresa)

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

        await db.flush()

        # 4. Crear Plan Premium
        plan_premium = SubscriptionPlan(
            name="Plan Premium",
            description="Acceso completo a todas las funcionalidades",
            price=99.99,
            duration_days=30,
            features={
                "campaigns_limit": None,
                "advanced_analytics": True,
                "priority_support": True,
                "custom_branding": True
            },
            is_active=True
        )
        db.add(plan_premium)
        await db.flush()

        # 5. Crear Suscripción Activa
        subscription = Subscription(
            user_id=empresa.id,
            plan_id=plan_premium.id,
            status=SubscriptionStatus.ACTIVE,
            start_date=datetime.utcnow() - timedelta(days=15),
            end_date=datetime.utcnow() + timedelta(days=15),
            auto_renew=True
        )
        db.add(subscription)

        # 6. Crear Transacción
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

        # 7. Crear Perfil de Influencer
        profile = InfluencerProfile(
            user_id=influencer.id,
            bio="Creadora de contenido especializada en lifestyle y tecnología. 🎥✨",
            profile_picture_url="https://i.pravatar.cc/300?img=47",
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
            youtube_handle="@MariaInfluencer",
            youtube_subscribers=45000,
            average_engagement_rate=4.5,
            suggested_rate_per_post=500.00,
            suggested_rate_per_story=200.00,
            suggested_rate_per_video=1000.00,
            categories={
                "primary": "Lifestyle",
                "secondary": ["Tecnología", "Moda", "Viajes"],
                "interests": ["Fotografía", "Diseño", "Emprendimiento"]
            },
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

        # 8. Crear Campañas
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

        await db.commit()
        
        print("✅ Seed completado exitosamente!")
        print("📋 Credenciales creadas:")
        print("   Admin: admin@influencers.com / admin123")
        print("   Empresa: empresa@test.com / empresa123")
        print("   Influencer: influencer@test.com / influencer123")

    except Exception as e:
        await db.rollback()
        print(f"❌ Error durante seed: {e}")
        # No lanzar excepción para no interrumpir el inicio de la app
