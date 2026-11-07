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

## OpenSpec

Features and non-trivial changes follow the OpenSpec flow. Artifacts are written **in Spanish** (enforced via `openspec/config.yaml`).

1. `/openspec-explore` — think through scope (optional)
2. `/openspec-propose <idea>` — creates proposal, specs, design, tasks under `openspec/changes/`
3. `/openspec-apply-change` — implement tasks one by one; tests + lint before checking each task
4. `rails-reviewer` / `react-reviewer` subagents on the diff
5. **QA visual** (`/qa-visual`) when the change has visual impact on the frontend: classify risk (low/medium/high sets the scope), write `TC-XX` cases in `openspec/changes/<change>/qa.md` with an executor each — `vitest` for states/validations, `script` via `tools/qa-runner` (Playwright on headless Brave, one call for the whole viewport × theme matrix), `mcp` (`qa-visual-runner` subagent, chrome-devtools) only for exploratory checks — review, audit + fix failures and re-run only the affected cases
6. `spec-verifier`
7. `/openspec-archive-change` — merge specs into `openspec/specs/`

`/orquestar <idea|change>` runs steps 2–7 end to end: delegates each stage to a subagent (the agent that writes code never reviews it) and stops with AskUserQuestion after the proposal, the reviews, QA visual and before commit/push.

Bugs: `/bugbuster` diagnoses without touching code (Railway logs read-only, writes `docs/fixes/<date>-<slug>-diagnostico.md`); `/quick-fix` fixes a bounded bug (≤ ~5 prod files, no migration or API contract change) test-first, logged in `docs/fixes/`. `/handoff` emits a copyable block to continue in a new conversation. These skills are adapted from Rankmi's RMAD.

Small fixes (typos, one-line bugs) can skip OpenSpec. Visual changes outside OpenSpec still go through `/qa-visual` (scenarios in `docs/qa/`).

## Code Search

Use [codegraph](https://github.com/colbymchenry/codegraph) (MCP server `codegraph` in `.mcp.json`, or CLI) instead of `grep` for:

- Locating symbols, models, controllers, or components when the exact file is unknown
- Measuring the blast radius of a change before proposing or applying it
- Any broad codebase search spanning multiple directories

```bash
codegraph query "<search>"        # find symbols
codegraph callers <symbol>        # who calls it
codegraph impact <symbol>         # what is affected by changing it
codegraph context "<task>"        # build markdown context for a task
codegraph sync                    # incremental re-index (runs automatically on SessionStart)
```

Fall back to `grep` only for exact string matches where a literal pattern is known.

## Git workflow

Single developer, early stage: **work directly on `main`** — no feature branches or PRs needed. Commit on `main` and `git push origin main` when the user asks to commit/push.

- Pushing to `main` runs CI (Backend CI / Frontend CI) and, if it passes, **deploys to production** (`.github/workflows/deploy.yml`). Run tests + lint before pushing; mention pending migrations.
- Still never force-push, `reset --hard`, or commit unrelated files (e.g. `.codegraph/daemon.pid`, personal `docker-compose.yml` tweaks).

## Guardrails (`.claude/`)

- **Permissions** (`settings.json`): `.env*` and Rails keys are unreadable; `schema.rb` is not editable; `db:drop`/`db:reset`/force-push are denied; `db:migrate` asks first. `git push` is allowed.
- **Hooks** (`.claude/hooks/`): block edits to generated/secret files, auto-fix with RuboCop/ESLint after each edit, run affected RSpec/Vitest tests when Claude stops (failures make it keep working).
- **Path-scoped rules** in `.claude/rules/` load only when touching matching files (specs, migrations, UI, frontend tests).
- Personal overrides go in `.claude/settings.local.json` or `CLAUDE.local.md` (both git-ignored).
