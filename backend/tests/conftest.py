import pytest
from collections.abc import AsyncGenerator
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.config import Settings
from app.db.session import get_async_session
from app.dependencies import (
    get_content_filter,
    get_geolocation_service,
    get_rate_limiter,
)
from app.main import app
from app.services.content_filter.basic import BasicContentFilter
from app.services.geolocation.mock import MockGeoLocationService
from app.services.rate_limiter.memory import InMemoryRateLimiter

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Override settings for testing."""
    return Settings(
        environment="test",
        database_url=TEST_DATABASE_URL,
        ip_hash_salt="test-salt",
        rate_limit_requests=5,
        rate_limit_window_hours=1,
        debug=True,
        content_filter_enabled=True,
    )


@pytest.fixture
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create fresh test database session for each test."""
    async_session = async_sessionmaker(test_engine, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest.fixture
def mock_geolocation() -> MockGeoLocationService:
    """Provide mock geolocation service."""
    return MockGeoLocationService(default_country="US", default_city="New York")


@pytest.fixture
def mock_rate_limiter() -> InMemoryRateLimiter:
    """Provide fresh rate limiter for each test."""
    return InMemoryRateLimiter()


@pytest.fixture
def mock_content_filter() -> BasicContentFilter:
    """Provide content filter."""
    return BasicContentFilter()


@pytest.fixture
async def client(
    test_db,
    mock_geolocation,
    mock_rate_limiter,
    mock_content_filter,
) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with overridden dependencies."""

    async def override_get_db():
        yield test_db

    def override_get_geolocation():
        return mock_geolocation

    def override_get_rate_limiter():
        return mock_rate_limiter

    def override_get_content_filter():
        return mock_content_filter

    app.dependency_overrides[get_async_session] = override_get_db
    app.dependency_overrides[get_geolocation_service] = override_get_geolocation
    app.dependency_overrides[get_rate_limiter] = override_get_rate_limiter
    app.dependency_overrides[get_content_filter] = override_get_content_filter

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
