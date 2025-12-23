"""
Script to initialize default subscription plans.
Run this after database migrations to populate initial plans.
"""
import sys
import os
import asyncio

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session_maker
from app.models.subscription_plan import SubscriptionPlan
from sqlalchemy import select


async def init_plans():
    """Initialize default subscription plans."""
    async with async_session_maker() as session:
        # Check if plans already exist
        result = await session.execute(select(SubscriptionPlan))
        existing_plans = result.scalars().all()
        
        if existing_plans:
            print("⚠️  Plans already exist. Skipping initialization.")
            return
        
        # Create default plans
        plans = [
            SubscriptionPlan(
                name="Plan Básico",
                description="Perfecto para pequeñas empresas",
                price=49.0,
                price_display="$49",
                billing_period="monthly",
                features=[
                    "Acceso a 50 perfiles de influencers",
                    "5 campañas activas simultáneas",
                    "Soporte por email",
                    "Análisis básicos"
                ],
                is_featured=False,
                is_active=True,
                display_order=1
            ),
            SubscriptionPlan(
                name="Plan Pro",
                description="Ideal para empresas en crecimiento",
                price=99.0,
                price_display="$99",
                billing_period="monthly",
                features=[
                    "Acceso ilimitado a perfiles",
                    "Campañas ilimitadas",
                    "Soporte prioritario 24/7",
                    "Análisis avanzados",
                    "Gestor de cuenta dedicado",
                    "API access"
                ],
                is_featured=True,
                is_active=True,
                display_order=2
            ),
            SubscriptionPlan(
                name="Plan Enterprise",
                description="Para grandes empresas",
                price=None,  # Custom pricing
                price_display="Personalizado",
                billing_period="custom",
                features=[
                    "Todo lo del Plan Pro",
                    "Integración personalizada",
                    "Capacitación del equipo",
                    "SLA garantizado",
                    "Reportes personalizados"
                ],
                is_featured=False,
                is_active=True,
                display_order=3
            )
        ]
        
        for plan in plans:
            session.add(plan)
        
        await session.commit()
        
        print("✅ Default subscription plans created successfully!")
        print(f"   - {len(plans)} plans initialized")


if __name__ == "__main__":
    print("🚀 Initializing subscription plans...")
    asyncio.run(init_plans())
    print("✅ Subscription plans initialization complete!")
