from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database configuration
DATABASE_URL = "sqlite:///./students.db"

# Create SQLite engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    """
    Dependency function to provide database session to route handlers.
    Automatically closes the session after the request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
