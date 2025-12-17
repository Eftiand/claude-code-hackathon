from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    cursor: str | None = Field(
        None, description="Cursor for pagination (base64 encoded timestamp)"
    )
    limit: int = Field(20, ge=1, le=100, description="Number of items per page")


class ErrorResponse(BaseModel):
    detail: str
    code: str


class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
