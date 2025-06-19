# Environment Variables Setup

## Quick Start

1. Copy the example file:
   `cp .env.example .env`

2. Update PostgreSQL password if needed:
   `POSTGRES_PASSWORD=your_actual_password`

3. Generate new secrets for production:
   `rails secret`

## Environment Variables

### Required for Development:
- `POSTGRES_USER`: PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD`: PostgreSQL password (empty for local dev)
- `POSTGRES_HOST`: Database host (default: localhost)
- `POSTGRES_PORT`: Database port (default: 5432)
- `SECRET_KEY_BASE`: Rails secret key
- `JWT_SECRET`: JWT authentication secret
