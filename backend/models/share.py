import sqlalchemy
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

class Share(Base):
    __tablename__ = 'shares'

    id: Mapped[int] = mapped_column(sqlalchemy.Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=False)
    vault_id: Mapped[int] = mapped_column(sqlalchemy.Integer, sqlalchemy.ForeignKey("vaults.id"), nullable=False)

    def __repr__(self):
        return f"<Share(share_id={self.id}, user_id={self.user_id}, vault_id={self.vault_id})>"
    
