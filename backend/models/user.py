import sqlalchemy
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import DeclarativeBase

class User(DeclarativeBase):
    __tablename__ = 'users'
    __tableargs__ = (UniqueConstraint('username', 'email'),)

    id: Mapped[int] = mapped_column(sqlalchemy.Integer, primary_key=True)
    username: Mapped[str] = mapped_column(sqlalchemy.String(50), nullable=False)
    email: Mapped[str] = mapped_column(sqlalchemy.String(50), nullable=False)
    password: Mapped[str] = mapped_column(sqlalchemy.String(50), nullable=False)

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email}, first_name={self.first_name}, last_name={self.last_name})>"