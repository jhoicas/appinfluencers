"""
Script to seed test transactions into the database.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.user import User
from sqlalchemy import select
from datetime import datetime, timedelta


async def seed_transactions():
    """Seed test transactions."""
    async with AsyncSessionLocal() as db:
        try:
            # Get users from database
            result = await db.execute(select(User))
            users = list(result.scalars().all())
            
            if not users:
                print("❌ No users found. Please create users first.")
                return
            
            print(f"✅ Found {len(users)} users")
            
            # Create test transactions
            transactions_data = []
            
            # Find empresa users
            empresa_users = [u for u in users if u.role.value == "EMPRESA"]
            
            if not empresa_users:
                print("⚠️  No EMPRESA users found. Creating transactions for first user.")
                empresa_users = [users[0]]
            
            for i, user in enumerate(empresa_users[:3]):  # Max 3 users
                # Subscription transactions
                transactions_data.extend([
                    Transaction(
                        user_id=user.id,
                        amount=99.99,
                        type=TransactionType.SUBSCRIPTION,
                        status=TransactionStatus.COMPLETED,
                        description=f"Suscripción Plan Pro - Mensual",
                        payment_method="credit_card",
                        transaction_reference=f"SUB-{user.id}-001",
                        created_at=datetime.utcnow() - timedelta(days=30)
                    ),
                    Transaction(
                        user_id=user.id,
                        amount=99.99,
                        type=TransactionType.SUBSCRIPTION,
                        status=TransactionStatus.COMPLETED,
                        description=f"Suscripción Plan Pro - Mensual",
                        payment_method="credit_card",
                        transaction_reference=f"SUB-{user.id}-002",
                        created_at=datetime.utcnow() - timedelta(days=60)
                    ),
                ])
                
                # Campaign transactions
                if i == 0:
                    transactions_data.extend([
                        Transaction(
                            user_id=user.id,
                            amount=299.99,
                            type=TransactionType.CAMPAIGN,
                            status=TransactionStatus.PENDING,
                            description="Campaña de Verano 2024 - Influencer Marketing",
                            payment_method="credit_card",
                            transaction_reference=f"CAMP-{user.id}-001",
                            created_at=datetime.utcnow() - timedelta(days=7)
                        ),
                        Transaction(
                            user_id=user.id,
                            amount=499.99,
                            type=TransactionType.CAMPAIGN,
                            status=TransactionStatus.COMPLETED,
                            description="Campaña de Lanzamiento de Producto",
                            payment_method="paypal",
                            transaction_reference=f"CAMP-{user.id}-002",
                            created_at=datetime.utcnow() - timedelta(days=15)
                        ),
                    ])
                
                # Failed transaction
                if i == 1:
                    transactions_data.append(
                        Transaction(
                            user_id=user.id,
                            amount=99.99,
                            type=TransactionType.SUBSCRIPTION,
                            status=TransactionStatus.FAILED,
                            description="Suscripción Plan Pro - Pago Rechazado",
                            payment_method="credit_card",
                            transaction_reference=f"SUB-{user.id}-FAIL-001",
                            created_at=datetime.utcnow() - timedelta(days=2)
                        )
                    )
                
                # More campaign transactions
                if i == 2:
                    transactions_data.extend([
                        Transaction(
                            user_id=user.id,
                            amount=199.99,
                            type=TransactionType.CAMPAIGN,
                            status=TransactionStatus.COMPLETED,
                            description="Campaña de Redes Sociales - Instagram",
                            payment_method="credit_card",
                            transaction_reference=f"CAMP-{user.id}-003",
                            created_at=datetime.utcnow() - timedelta(days=20)
                        ),
                        Transaction(
                            user_id=user.id,
                            amount=149.99,
                            type=TransactionType.SUBSCRIPTION,
                            status=TransactionStatus.COMPLETED,
                            description="Suscripción Plan Premium - Mensual",
                            payment_method="credit_card",
                            transaction_reference=f"SUB-{user.id}-003",
                            created_at=datetime.utcnow() - timedelta(days=10)
                        ),
                    ])
            
            # Add refund example
            if empresa_users:
                transactions_data.append(
                    Transaction(
                        user_id=empresa_users[0].id,
                        amount=-99.99,
                        type=TransactionType.REFUND,
                        status=TransactionStatus.COMPLETED,
                        description="Reembolso - Campaña Cancelada",
                        payment_method="credit_card",
                        transaction_reference=f"REF-{empresa_users[0].id}-001",
                        created_at=datetime.utcnow() - timedelta(days=5)
                    )
                )
            
            # Insert all transactions
            for transaction in transactions_data:
                db.add(transaction)
            
            await db.commit()
            
            print(f"\n✅ Successfully created {len(transactions_data)} test transactions!")
            print("\n📊 Transaction Summary:")
            print(f"   - Completed: {sum(1 for t in transactions_data if t.status == TransactionStatus.COMPLETED)}")
            print(f"   - Pending: {sum(1 for t in transactions_data if t.status == TransactionStatus.PENDING)}")
            print(f"   - Failed: {sum(1 for t in transactions_data if t.status == TransactionStatus.FAILED)}")
            print(f"\n💰 Total Amount: ${sum(t.amount for t in transactions_data if t.status == TransactionStatus.COMPLETED):.2f}")
            
        except Exception as e:
            print(f"❌ Error seeding transactions: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("🚀 Seeding test transactions...")
    asyncio.run(seed_transactions())
    print("✅ Done!")
