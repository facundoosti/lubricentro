# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Rails 8.0.2 API-only · PostgreSQL (production) / SQLite3 (development) · Ruby 3.3  
Auth: Devise + Doorkeeper (OAuth2) + JWT  
Serialization: Blueprinter · Pagination: Pagy · Background jobs: Solid Queue

## Commands

```bash
# Local
bundle exec rails server
bundle exec rspec
bundle exec rspec spec/path/to_spec.rb   # single spec
bundle exec rubocop
rails db:migrate
rails console

# Via Docker (from repo root)
make test-backend
make lint-backend
make db-migrate
make console
```

## API Structure

All endpoints under `api/v1/`. Routes: auth, dashboard/stats, customers (nested: vehicles, appointments, service_records), vehicles, services, products, appointments, service_records.

**Response format — always:**
```ruby
# Success
render json: { success: true, data: serialized_data, message: "..." }

# Error
render json: { success: false, errors: ["..."], message: "..." }, status: :unprocessable_entity
```

## Domain Models

- `Customer` → has many `Vehicle`s, `Appointment`s, `ServiceRecord`s
- `Vehicle` → belongs to `Customer`, has many `Appointment`s, `ServiceRecord`s
- `ServiceRecord` → has many `Service`s and `Product`s (through join tables)
- `Product` → name, description, unit_price, unit

## Key Patterns

**Controllers**: Always use strong params. Validate before save. Never skip param validation.

**Models**: Schema annotations auto-added by `annotate` gem — do not edit those comment blocks manually.

**Serializers** (`app/serializers/`): Use Blueprinter with named views (e.g., `:default`, `:extended`).

**Never edit `schema.rb` directly** — always generate and run a migration.

## Environment Variables

```bash
# Required (copy .env.example → .env)
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY_BASE=          # rails secret
JWT_SECRET=
```

## CI

GitHub Actions on push/PR to `main`/`develop` (changes in `backend/`):
- `bundle exec rspec` against PostgreSQL
- `bundle exec rubocop`
- `bundle exec brakeman` (security scan)
- bundle-audit (dependency vulnerabilities)

Deploy target: **Railway**
