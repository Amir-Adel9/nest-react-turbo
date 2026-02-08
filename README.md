# Easygenerator – Full Stack Auth

Monorepo: **api** (NestJS + MongoDB) and **web** (React + Vite). No env files are required for a quick run; sensible defaults are built in.

## Principles

- **Monorepo:** [Turborepo](https://turbo.build/repo) with `apps/api` (NestJS + MongoDB), `apps/web` (React + Vite), and `packages/api-contract` (OpenAPI schema and generated types for the frontend).
- **Auth:** Cookie-based sessions only: httpOnly `access_token` and `refresh_token`; refresh path-restricted; no auth state in `localStorage`.
- **Security:** The project uses a **Dual-Token Rotation** strategy with **httpOnly** cookies: access and refresh tokens are stored only in httpOnly cookies, the refresh token is path-scoped to `/api/auth/refresh` and rotated on refresh; no tokens in `localStorage` or client-side JS.
- **Contract:** API surface is described by OpenAPI; the web app uses `openapi-fetch` and types generated from `api-contract`.
- **CI/CD:** Automated pipeline in `.github/workflows/ci.yml` runs on push/PR to `main`: **pnpm** install, lint, build, unit tests, and e2e tests (API and web); MongoDB is provided via a GitHub Actions service container for API e2e.
- **Defaults:** The app runs with `pnpm install` and `pnpm start:dev` (with Docker MongoDB); env is optional for overrides.

## Requirements

- **Node** ≥18  
- **pnpm**  
- **Docker** (for MongoDB in dev and for the full prod stack)

## Setup and run

**Clone and install:**

```sh
git clone <repo-url>
cd <repo>
pnpm install
```

**Development:** Start MongoDB, then run API and web via Turbo.

```sh
pnpm db:up
pnpm start:dev
```

- **API:** http://localhost:3000  
- **Web:** http://localhost:5173 (proxies `/api` to the API)

**Production (all in Docker):**

```sh
pnpm start:prod
```

- App: http://localhost:8080 (override with `GATEWAY_PORT` in `.env` if needed)

**Optional env:** Copy `.env.example` to `.env` at the repo root and `apps/api/.env.example` to `apps/api/.env`. Main variables:

| Variable | Description |
|----------|-------------|
| `GATEWAY_PORT` | Host port for the prod gateway (default `8080`) |
| `MONGO_INITDB_DATABASE` | MongoDB database name (e.g. `easygenerator`) |
| `MONGODB_URI` | MongoDB connection string (API) |
| `JWT_SECRET` | Secret for JWT signing (API) |
| `PORT` | API port (default `3000`) |
| `NODE_ENV` | `development` or `production` |

## Testing

- **API unit tests:** `pnpm --filter api test`
- **API E2E tests:** `pnpm --filter api test:e2e`  
  Uses in-memory MongoDB when `mongodb-memory-server` is installed; otherwise set `MONGODB_URI` (e.g. Docker MongoDB). Install in-memory: `pnpm add -D mongodb-memory-server --filter api`
- **Web unit tests:** `pnpm --filter web test` or `pnpm --filter web test:run`
- **Web E2E tests (Playwright):** `pnpm --filter web test:e2e`  
  Requires the app to be running (e.g. `pnpm start:dev` or web preview + API dev). Optionally set `BASE_URL`.
- **All unit tests from root:** `pnpm test`
- **Unit + API E2E (run everything that doesn’t need the app):** `pnpm test:all`
- **E2E from root:** `pnpm test:e2e:api` or `pnpm test:e2e:web`

## Useful links

- [Turborepo docs](https://turbo.build/repo/docs) (tasks, caching, filtering)
