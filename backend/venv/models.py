from sqlalchemy import Column, Integer, String, Float, JSON
from database import Base


class Student(Base):
    """
    SQLAlchemy model for storing student data.
    
    Attributes:
        id: Primary key, auto-incremented
        name: Student name
        scores: JSON field storing subject scores as a dictionary
                Example: {"Math": 78, "Biology": 82, "Physics": 91}
        average: Calculated average score across all subjects
    """
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    scores = Column(JSON, nullable=False)  # Stores dynamic subject scores
    average = Column(Float, nullable=False)

    def __repr__(self):
        return f"<Student(id={self.id}, name={self.name}, average={self.average})>"


class Admin(Base):
    """
    SQLAlchemy model for admin authentication.
    
    Attributes:
        id: Primary key, auto-incremented
        username: Admin username (unique)
        password: Hashed password for authentication
    """
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, nullable=False, unique=True, index=True)
    password = Column(String, nullable=False)  # Stores hashed password

    def __repr__(self):
        return f"<Admin(id={self.id}, username={self.username})>"
