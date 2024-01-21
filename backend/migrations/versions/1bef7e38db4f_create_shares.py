"""create_shares

Revision ID: 1bef7e38db4f
Revises: 4f28e248f9e3
Create Date: 2024-01-21 09:31:43.902305

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1bef7e38db4f'
down_revision: Union[str, None] = '4f28e248f9e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shares",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("vault_id", sa.Integer, sa.ForeignKey("vaults.id"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("shares")
