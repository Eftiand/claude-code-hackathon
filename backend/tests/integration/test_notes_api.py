import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_note_success(client: AsyncClient):
    """Test successful note creation."""
    response = await client.post(
        "/api/v1/notes",
        json={
            "message": "Hello from the test!",
            "name": "Test User",
            "country_code": "US",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Hello from the test!"
    assert data["name"] == "Test User"
    assert data["country_code"] == "US"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_note_minimal(client: AsyncClient):
    """Test note creation with minimal data."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": "Just a message"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Just a message"
    assert data["name"] is None


@pytest.mark.asyncio
async def test_create_note_validation_empty_message(client: AsyncClient):
    """Test validation error for empty message."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": ""},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_note_validation_whitespace_message(client: AsyncClient):
    """Test validation error for whitespace-only message."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": "   "},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_note_validation_message_too_long(client: AsyncClient):
    """Test validation error for message exceeding max length."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": "x" * 201},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_note_validation_invalid_country_code(client: AsyncClient):
    """Test validation error for invalid country code."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": "Test", "country_code": "INVALID"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_note_validation_invalid_lat(client: AsyncClient):
    """Test validation error for invalid latitude."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": "Test", "lat": 91, "lon": 0},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_note_with_location(client: AsyncClient):
    """Test note creation with explicit location."""
    response = await client.post(
        "/api/v1/notes",
        json={
            "message": "Location test",
            "lat": 40.7128,
            "lon": -74.0060,
            "share_location": True,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["lat"] == 40.7128
    assert data["lon"] == -74.0060


@pytest.mark.asyncio
async def test_list_notes_empty(client: AsyncClient):
    """Test listing notes when empty."""
    response = await client.get("/api/v1/notes")
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == []
    assert data["has_more"] is False
    assert data["next_cursor"] is None


@pytest.mark.asyncio
async def test_list_notes_with_data(client: AsyncClient):
    """Test listing notes with data."""
    # Create some notes
    for i in range(3):
        await client.post(
            "/api/v1/notes",
            json={"message": f"Note {i}"},
        )

    response = await client.get("/api/v1/notes")
    assert response.status_code == 200
    data = response.json()
    assert len(data["notes"]) == 3


@pytest.mark.asyncio
async def test_list_notes_pagination(client: AsyncClient):
    """Test cursor-based pagination."""
    # Create notes
    for i in range(5):
        await client.post(
            "/api/v1/notes",
            json={"message": f"Note {i}"},
        )

    # Get first page
    response = await client.get("/api/v1/notes?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["notes"]) == 2
    assert data["has_more"] is True
    assert data["next_cursor"] is not None

    # Get second page
    response = await client.get(f"/api/v1/notes?limit=2&cursor={data['next_cursor']}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["notes"]) == 2


@pytest.mark.asyncio
async def test_list_notes_invalid_cursor(client: AsyncClient):
    """Test invalid cursor handling."""
    response = await client.get("/api/v1/notes?cursor=invalid")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_note_points(client: AsyncClient):
    """Test getting notes as points for globe."""
    # Create a note with location
    await client.post(
        "/api/v1/notes",
        json={
            "message": "Point test",
            "lat": 40.7128,
            "lon": -74.0060,
            "share_location": True,
        },
    )

    response = await client.get("/api/v1/notes/points")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    point = data[0]
    assert "lat" in point
    assert "lng" in point
    assert "label" in point


@pytest.mark.asyncio
async def test_rate_limiting(client: AsyncClient, mock_rate_limiter):
    """Test rate limiting enforcement."""
    # Make requests up to limit
    for i in range(5):
        response = await client.post(
            "/api/v1/notes",
            json={"message": f"Rate limit test {i}"},
        )
        assert response.status_code == 201

    # Next request should be rate limited
    response = await client.post(
        "/api/v1/notes",
        json={"message": "Should be rate limited"},
    )
    assert response.status_code == 429
    assert "Retry-After" in response.headers


@pytest.mark.asyncio
async def test_honeypot_detection(client: AsyncClient):
    """Test honeypot field catches bots."""
    response = await client.post(
        "/api/v1/notes",
        json={
            "message": "Bot message",
            "_hp_field": "filled by bot",
        },
    )
    # Should appear successful but note is not stored
    assert response.status_code == 201

    # Check that no actual note was stored
    list_response = await client.get("/api/v1/notes")
    data = list_response.json()
    # The honeypot note should not appear in the list
    assert all(n["message"] != "Bot message" for n in data["notes"])


@pytest.mark.asyncio
async def test_content_filter(client: AsyncClient):
    """Test content filter blocks inappropriate content."""
    response = await client.post(
        "/api/v1/notes",
        json={"message": "This is spam content"},
    )
    assert response.status_code == 400
    assert "inappropriate" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_country_stats_empty(client: AsyncClient):
    """Test country stats when empty."""
    response = await client.get("/api/v1/stats/countries")
    assert response.status_code == 200
    data = response.json()
    assert data["countries"] == []
    assert data["total_notes"] == 0


@pytest.mark.asyncio
async def test_country_stats_with_data(client: AsyncClient):
    """Test country stats with data."""
    # Create notes from different countries
    await client.post(
        "/api/v1/notes",
        json={"message": "US note", "country_code": "US"},
    )
    await client.post(
        "/api/v1/notes",
        json={"message": "UK note", "country_code": "GB"},
    )
    await client.post(
        "/api/v1/notes",
        json={"message": "US note 2", "country_code": "US"},
    )

    response = await client.get("/api/v1/stats/countries")
    assert response.status_code == 200
    data = response.json()
    assert data["total_notes"] == 3
    assert len(data["countries"]) == 2

    # US should have count 2
    us_stats = next(c for c in data["countries"] if c["country_code"] == "US")
    assert us_stats["count"] == 2


@pytest.mark.asyncio
async def test_heatmap_endpoint(client: AsyncClient):
    """Test heatmap endpoint."""
    # Create a note
    await client.post(
        "/api/v1/notes",
        json={"message": "Heatmap test", "country_code": "US"},
    )

    response = await client.get("/api/v1/stats/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    point = data[0]
    assert "lat" in point
    assert "lng" in point
    assert "weight" in point
