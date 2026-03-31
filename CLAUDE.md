# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

Sistema Lubricentro — automotive service management system.

```
backend/    # Rails 8 API-only  → see backend/CLAUDE.md
frontend/   # React 19 SPA      → see frontend/CLAUDE.md
agent/      # N8N automation docs (WhatsApp + AI chatbot integration)
docs/       # Deployment guides
```

Each app has its own `CLAUDE.md` with stack details, commands, and patterns. Read the relevant one before working in that app.

## Docker Orchestration (from repo root)

```bash
make dev              # Start all services (backend :3000, frontend :5173, postgres :5432)
make stop             # Stop and clean temp files
make dev-local        # Postgres only — run backend and frontend locally
make logs             # Tail all logs
make test             # Run all tests (backend + frontend)
make lint             # Run all linters
make db-migrate       # Run pending Rails migrations
make db-reset         # Drop, create, migrate, seed
make console          # Rails console
make health           # Check service connectivity
```

## Services

| Service  | URL                    | Notes                        |
|----------|------------------------|------------------------------|
| Frontend | http://localhost:5173  | Vite HMR                     |
| Backend  | http://localhost:3000  | Rails API, health at `/up`   |
| Postgres | localhost:5432         | DB: `lubricentro_development` |
