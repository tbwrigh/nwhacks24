import sqlalchemy
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base

class Vault(Base):
    __tablename__ = 'vaults'
    __tableargs__ = (UniqueConstraint('bucket_name'),)

    id: Mapped[int] = mapped_column(sqlalchemy.Integer, primary_key=True)
    name: Mapped[str] = mapped_column(sqlalchemy.String(255), nullable=False)
    user_id: Mapped[int] = mapped_column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'), nullable=False)
    bucket_name: Mapped[str] = mapped_column(sqlalchemy.String(255), nullable=False)

    def __repr__(self):
        return f"<Vault(vault_id={self.id}, name={self.name}, user_id={self.user_id}, bucket_name={self.bucket_name})>"