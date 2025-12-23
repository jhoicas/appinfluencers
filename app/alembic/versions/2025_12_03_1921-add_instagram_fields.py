"""add instagram fields to profiles

Revision ID: add_instagram_fields
Revises: 8846e3b6e5de
Create Date: 2025-12-03 19:21:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_instagram_fields'
down_revision: Union[str, None] = '8846e3b6e5de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add instagram_handle column
    op.add_column('influencer_profiles', 
                  sa.Column('instagram_handle', sa.String(length=100), nullable=True))
    
    # Add instagram_followers column
    op.add_column('influencer_profiles', 
                  sa.Column('instagram_followers', sa.Integer(), nullable=True))


def downgrade() -> None:
    # Remove instagram columns
    op.drop_column('influencer_profiles', 'instagram_followers')
    op.drop_column('influencer_profiles', 'instagram_handle')
