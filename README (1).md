# 🌍 Agentic Travel AI Planner

> **Tier-3 Production-Level Agentic AI Project** — A full-stack intelligent travel planning system powered by multi-agent LLM orchestration, RAG knowledge retrieval, and a polished React frontend.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Guide](#frontend-guide)
- [Agent Workflow](#agent-workflow)
- [Database Schema](#database-schema)
- [RAG Knowledge Base](#rag-knowledge-base)
- [Data & Seeding](#data--seeding)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Agentic Travel AI Planner** is a production-grade AI system that demonstrates real-world backend engineering and agentic AI workflows. Users describe their trip in natural language, and the system:

1. Parses intent and extracts structured travel parameters
2. Retrieves relevant knowledge from a FAISS vector store (RAG)
3. Orchestrates multiple specialized agents via LangGraph
4. Generates a complete, day-by-day itinerary with hotels, tips, and budget
5. Persists sessions to a PostgreSQL database via SQLAlchemy

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│   (Chat UI · Itinerary Cards · Trip History · Quick Prompts)│
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────────────────┐
│                   FastAPI Backend                           │
│   /api/v1/itinerary/generate   POST                        │
│   /api/v1/trips                GET | POST                  │
│   /api/v1/trips/{id}           GET | DELETE                │
└──────┬─────────────┬──────────────────────────────┬─────────┘
       │             │                              │
┌──────▼──────┐ ┌────▼─────────────┐ ┌─────────────▼────────┐
│  LangGraph  │ │   FAISS + RAG    │ │  SQLAlchemy + PostgreSQL│
│  Agents     │ │   Knowledge Base │ │  Session · Trip · User │
│  ─────────  │ │  ──────────────  │ │  ───────────────────── │
│  Planner    │ │  Destination DB  │ │  Async ORM             │
│  Researcher │ │  Hotel Vectors   │ │  Alembic Migrations    │
│  Validator  │ │  Tips Corpus     │ └────────────────────────┘
└─────────────┘ └──────────────────┘
```

### Agent Flow (LangGraph)

```
User Query
    │
    ▼
[Intent Parser] ──► extracts: destination, dates, travelers, budget, interests
    │
    ▼
[RAG Retriever] ──► fetches relevant context from FAISS vector store
    │
    ▼
[Planner Agent] ──► generates day-by-day itinerary
    │
    ▼
[Enrichment Agent] ──► adds hotels, restaurants, cost estimates
    │
    ▼
[Validator Agent] ──► checks coherence, flags issues
    │
    ▼
[Formatter] ──► structured JSON response
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, DM Sans + Fraunces fonts |
| **Backend** | FastAPI 0.104, Python 3.11, Uvicorn |
| **AI / Agents** | LangChain 0.1, LangGraph 0.0.20, OpenAI GPT-4o |
| **RAG** | FAISS (faiss-cpu), LangChain embeddings |
| **Database** | PostgreSQL + SQLAlchemy 2.0 (async), asyncpg |
| **Validation** | Pydantic v2 |
| **Config** | pydantic-settings, python-dotenv |

---

## Project Structure

```
agentic-travel-ai-planner/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entrypoint
│   │   ├── config.py                # Settings via pydantic-settings
│   │   ├── database.py              # Async SQLAlchemy engine & session
│   │   ├── models/
│   │   │   ├── trip.py              # Trip ORM model
│   │   │   ├── session.py           # Chat session ORM model
│   │   │   └── user.py              # User ORM model
│   │   ├── schemas/
│   │   │   ├── trip.py              # Pydantic I/O schemas
│   │   │   └── itinerary.py         # Itinerary response schema
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py        # API router aggregator
│   │   │       ├── itinerary.py     # /itinerary endpoints
│   │   │       └── trips.py         # /trips CRUD endpoints
│   │   ├── agents/
│   │   │   ├── graph.py             # LangGraph state machine
│   │   │   ├── planner.py           # Main planner agent node
│   │   │   ├── researcher.py        # RAG-augmented researcher node
│   │   │   └── validator.py         # Output validation node
│   │   ├── rag/
│   │   │   ├── vectorstore.py       # FAISS vector store manager
│   │   │   ├── retriever.py         # Retrieval chain
│   │   │   └── ingest.py            # Data ingestion pipeline
│   │   └── utils/
│   │       ├── prompts.py           # System & user prompt templates
│   │       └── parsers.py           # LLM output parsers
│   └── alembic/                     # DB migrations
│       ├── env.py
│       └── versions/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main app with chat UI
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global reset
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── data/
│   ├── destinations/                # Markdown knowledge files per destination
│   │   ├── tokyo.md
│   │   ├── paris.md
│   │   └── ...
│   ├── hotels/                      # Hotel data CSVs
│   └── seed_vectorstore.py          # Script: build FAISS index from data/
│
├── docs/
│   ├── README.md                    # This file
│   ├── API.md                       # Full API reference
│   └── ARCHITECTURE.md              # Deep-dive architecture notes
│
├── .gitignore
├── requirements.txt
└── .env.example
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+ and npm
- PostgreSQL 15+
- An OpenAI API key

---

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/ankitkr777/agentic-travel-ai-planner.git
cd agentic-travel-ai-planner

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys and DB URL (see Environment Variables section)

# 5. Create the PostgreSQL database
createdb travel_ai_db

# 6. Run database migrations
alembic upgrade head

# 7. Seed the FAISS vector store (one-time)
python data/seed_vectorstore.py

# 8. Start the backend
uvicorn backend.app.main:app --reload --port 8000
```

The backend will be live at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be live at `http://localhost:5173`.

To build for production:
```bash
npm run build        # outputs to frontend/dist/
```

---

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# OpenAI
OPENAI_API_KEY=sk-...

# PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/travel_ai_db

# App
APP_ENV=development
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173

# RAG / FAISS
VECTORSTORE_PATH=./data/vectorstore
EMBEDDING_MODEL=text-embedding-3-small
```

**Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## API Reference

Full interactive docs: `http://localhost:8000/docs` (Swagger UI)

### POST `/api/v1/itinerary/generate`

Generate a complete travel itinerary from a natural language query.

**Request Body**
```json
{
  "query": "5-day solo trip to Tokyo under $2000",
  "session_id": "session_abc123"
}
```

**Response (200)**
```json
{
  "destination": "Tokyo",
  "duration_days": 5,
  "travelers": "Solo",
  "budget_estimate": "$1,400–$1,900",
  "summary": "Here's your 5-day Tokyo adventure...",
  "itinerary": [
    {
      "day_number": 1,
      "title": "Arrival & Shinjuku",
      "activities": [
        {
          "time": "14:00",
          "name": "Check in & Shinjuku Gyoen Garden",
          "description": "Decompress in one of Tokyo's most beautiful parks.",
          "cost": 5
        }
      ]
    }
  ],
  "hotels": [
    { "name": "Shinjuku Granbell Hotel", "stars": 4, "price_per_night": "$95/night" }
  ],
  "tips": [
    "Get an IC card (Suica/Pasmo) at the airport for seamless transit."
  ]
}
```

---

### GET `/api/v1/trips`

List all saved trips for the current session.

### POST `/api/v1/trips`

Save a generated trip to the database.

### GET `/api/v1/trips/{trip_id}`

Retrieve a specific saved trip.

### DELETE `/api/v1/trips/{trip_id}`

Delete a saved trip.

---

## Frontend Guide

The React frontend (`frontend/src/App.jsx`) is a single-file component that includes:

| Component | Description |
|---|---|
| `App` | Root — manages trips, messages, API calls |
| `Sidebar` | Trip history and navigation |
| `Message` | Renders both user and AI messages |
| `DayCard` | Collapsible day-by-day itinerary card |
| `useTypewriter` | Hook for animated text reveal on AI responses |

**Key behaviors:**
- Sends `POST /api/v1/itinerary/generate` on each user message
- Falls back to mock data if the backend is unreachable (great for UI development)
- Supports `Enter` to send, `Shift+Enter` for new lines
- Quick-prompt buttons for common trip types

**To change the API base URL**, edit line 3 of `App.jsx`:
```js
const API_BASE = "http://localhost:8000";
```

---

## Agent Workflow

The LangGraph state machine (`backend/app/agents/graph.py`) runs three sequential nodes:

### 1. Researcher Node
Retrieves relevant information from the FAISS vector store using the destination as the query key. Returns top-k document chunks covering attractions, culture, weather, transport, and local tips.

### 2. Planner Node
Takes the user query + retrieved context and uses GPT-4o with a structured output prompt to generate the day-by-day itinerary. Output is parsed into a `ItinerarySchema` Pydantic model.

### 3. Validator Node
Checks that:
- Day count matches requested duration
- Budget is not drastically exceeded
- All required fields are present

If validation fails, the state graph loops back to the Planner with correction hints (up to 2 retries).

---

## Database Schema

```sql
-- trips
CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  destination TEXT NOT NULL,
  query       TEXT NOT NULL,
  response    JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- sessions
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Managed via **Alembic** migrations. Run `alembic revision --autogenerate -m "description"` to create new migrations.

---

## RAG Knowledge Base

The vector store is built from Markdown files in `data/destinations/`. Each file covers one city with sections:

- **Overview** — geography, culture, best time to visit
- **Must-See Attractions** — with descriptions and costs
- **Local Food & Restaurants** — neighbourhood by neighbourhood
- **Transport** — airport transfer, city transit, apps
- **Accommodation Zones** — where to stay by budget
- **Practical Tips** — language, currency, safety, SIM cards

**To add a new destination:**
1. Create `data/destinations/your_city.md` following the template
2. Run `python data/seed_vectorstore.py` to re-index

The ingestion pipeline splits documents into 512-token chunks with 64-token overlap, embeds them with `text-embedding-3-small`, and saves the FAISS index to `data/vectorstore/`.

---

## Data & Seeding

### `data/seed_vectorstore.py`

Reads all `.md` files from `data/destinations/`, embeds them, and builds the FAISS index:

```bash
python data/seed_vectorstore.py
# Output: data/vectorstore/index.faiss  +  index.pkl
```

### Sample Destinations Included

| Destination | File |
|---|---|
| Tokyo, Japan | `data/destinations/tokyo.md` |
| Paris, France | `data/destinations/paris.md` |
| Bali, Indonesia | `data/destinations/bali.md` |
| New York, USA | `data/destinations/new_york.md` |
| Barcelona, Spain | `data/destinations/barcelona.md` |

---

## Deployment

### Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Services:
#   backend  → http://localhost:8000
#   frontend → http://localhost:5173
#   postgres → localhost:5432
```

`docker-compose.yml` is included in the repo root.

### Manual (VPS / EC2)

1. Set up PostgreSQL, seed the DB
2. Run the FastAPI backend with `gunicorn` + `uvicorn` workers
3. Build the React frontend and serve via Nginx
4. Use Nginx as a reverse proxy for the API

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feature/your-feature`
2. Make your changes with clear commits
3. Open a Pull Request describing what you changed and why

Please follow the existing code style (Black for Python, Prettier for JS).

---

## License

MIT License — see `LICENSE` for details.

---

*Built as a Tier-3 production demonstration of agentic AI engineering. Backend by the AI Engineer & Backend Dev roles; Frontend & Docs by the Frontend Dev & Data roles.*
