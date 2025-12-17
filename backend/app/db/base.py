from sqlmodel import SQLModel

# Re-export SQLModel's metadata for Alembic
# All models should inherit from SQLModel with table=True
Base = SQLModel
