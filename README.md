# Global Candles

An interactive 3D globe where users light candles and leave messages from around the world. Watch as candles illuminate the globe, creating a visual map of global connection and participation.

![Global Candles](https://img.shields.io/badge/status-in%20development-yellow)

## Features

- **Interactive 3D Globe** - Powered by Three.js via react-globe.gl with custom candle rendering
- **Cinematic Intro** - Space-themed animation with starfield, nebula effects, and animated title
- **3D Candles** - Procedurally generated candles with flames, glow, and lighting effects
- **Smart Location Input** - Dual location detection via IP geolocation and address search (OpenStreetMap)
- **Country Visualization** - Country polygons with outlines on the globe
- **Privacy-First** - IP addresses are hashed, never stored raw
- **Anti-Spam** - Rate limiting, content filtering, and honeypot protection

## Tech Stack

### Frontend
- React 19
- Vite
- react-globe.gl (Three.js)
- Custom Three.js objects (candles, flames, glow effects)

### Backend
- Python 3.11+
- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- SQLite (dev) / PostgreSQL (prod)
- Alembic migrations

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## How It Works

1. **Intro Animation** - Users are greeted with a cinematic space-themed intro featuring animated stars, nebula effects, and the "Global Candles" title reveal

2. **Add a Candle** - Click the "Add Pin" button to open the modal where you can:
   - Enter your name (optional) and message
   - Auto-detect your location via IP
   - Search for a specific location using OpenStreetMap

3. **Light the Globe** - Your candle appears on the globe as a 3D object with:
   - Animated flame with inner/outer glow
   - Point light that illuminates the surrounding area
   - Ping ring animation at the base

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/notes` | Submit a new candle/note |
| `GET` | `/api/v1/notes` | List notes (paginated) |
| `GET` | `/api/v1/notes/points` | Get notes as globe points |
| `GET` | `/api/v1/stats/countries` | Get note counts by country |
| `GET` | `/api/v1/stats/heatmap` | Get heatmap data |
| `GET` | `/api/v1/health` | Health check |

### Submit a Note

```bash
curl -X POST http://localhost:8000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Lighting a candle from New York!",
    "name": "Alice",
    "lat": 40.7128,
    "lon": -74.006,
    "share_location": true
  }'
```

### Get Notes for Globe

```bash
curl http://localhost:8000/api/v1/notes/points
```

## Project Structure

```
global-candles/
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── notes.js        # API client
│   │   ├── components/
│   │   │   ├── Globe/          # 3D globe with candles
│   │   │   ├── IntroAnimation/ # Cinematic intro
│   │   │   └── UserModal/      # Note submission form
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── core/              # Security, exceptions
│   │   ├── db/                # Database layer
│   │   ├── models/            # SQLModel models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   │   ├── geolocation/   # IP lookup providers
│   │   │   ├── rate_limiter/  # Rate limiting
│   │   │   └── content_filter/# Spam filtering
│   │   └── main.py
│   ├── alembic/               # Database migrations
│   ├── tests/
│   └── requirements.txt
│
└── README.md
```

## Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite+aiosqlite:///./globe_notes.db` |
| `IP_HASH_SALT` | Salt for hashing IPs | (change in production!) |
| `CORS_ORIGINS` | Allowed origins | `["http://localhost:5173"]` |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `5` |
| `RATE_LIMIT_WINDOW_HOURS` | Rate limit window | `1` |
| `DEBUG` | Enable debug mode/API docs | `false` |

## Development

### Running Tests

```bash
cd backend
source .venv/bin/activate
pytest -v
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Architecture Decisions

- **Custom Three.js Objects** - Candles are procedurally generated with CylinderGeometry, SphereGeometry for flames, and PointLight for realistic glow
- **Dual Location Input** - Supports both IP-based auto-detection (ipapi.co) and address search (Nominatim/OpenStreetMap)
- **Swappable Geolocation** - Backend uses abstract interface for easy provider swapping (ip-api.com, MaxMind, etc.)
- **In-Memory Rate Limiting** - Development-ready with Redis-swappable architecture for production
- **Cursor Pagination** - More efficient than offset pagination for large datasets
- **IP Hashing** - Uses HMAC-SHA256 for secure, non-reversible IP hashing
- **Honeypot Protection** - Silent bot rejection without alerting attackers

## License

MIT
