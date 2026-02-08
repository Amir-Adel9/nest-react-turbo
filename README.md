# Easygenerator – Full Stack Auth

Monorepo: **api** (NestJS + MongoDB) and **web** (React + Vite). No env files are required for a quick run; sensible defaults are built in.

## Principles

- **Monorepo:** [Turborepo](https://turbo.build/repo) with `apps/api` (NestJS + MongoDB), `apps/web` (React + Vite), and `packages/api-contract` (OpenAPI schema and generated types for the frontend).
- **Auth:** Cookie-based sessions only: httpOnly `access_token` and `refresh_token`; refresh path-restricted; no auth state in `localStorage`.
- **Security:** The project uses a **Dual-Token Rotation** strategy with **httpOnly** cookies: access and refresh tokens are stored only in httpOnly cookies, the refresh token is path-scoped to `/api/auth/refresh` and rotated on refresh; no tokens in `localStorage` or client-side JS.
- **Contract:** API surface is described by OpenAPI; the web app uses `openapi-fetch` and types generated from `api-contract`.
- **CI/CD:** Automated pipeline in `.github/workflows/ci.yml` runs on push/PR to `main`: install, lint, build, unit tests, and e2e tests (API and web); MongoDB is provided via a GitHub Actions service container for API e2e. CI uses pnpm; local usage works with npm, Yarn, or pnpm.
- **Defaults:** The app runs with `npm install` / `yarn` / `pnpm install` and `npm run start:dev` (or `yarn start:dev` / `pnpm start:dev`) with Docker MongoDB; env is optional for overrides.

## Requirements

- **Node** ≥18
- **npm**, **Yarn**, or **pnpm** (or Node 18+ with [Corepack](https://nodejs.org/api/corepack.html) enabled for pnpm)
- **Docker** (for MongoDB in dev and for the full prod stack)

## Package manager

All root scripts use Turborepo and work with **npm**, **Yarn**, or **pnpm**. Use the same commands with your preferred manager (e.g. `npm run start:dev`, `yarn start:dev`, or `pnpm start:dev`).

## Setup and run

**Clone and install:**

```sh
git clone <repo-url>
cd <repo>
npm install
# or: yarn
# or: pnpm install
```

**Development:** Start MongoDB, then run API and web via Turbo.

```sh
npm run db:up
npm run start:dev
# or: yarn db:up && yarn start:dev
# or: pnpm db:up && pnpm start:dev
```

- **API:** http://localhost:3000  
- **Web:** http://localhost:5173 (proxies `/api` to the API)

**Production (all in Docker):**

```sh
npm run start:prod
# or: yarn start:prod
# or: pnpm start:prod
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

Use the same root scripts with npm, Yarn, or pnpm (e.g. `npm run test`, `yarn test:e2e:api`, `pnpm run test:all`).

- **API unit tests:** `npm run test` (runs all unit tests) or run from `apps/api`: `npm run test` / `yarn test` / `pnpm test`
- **API E2E tests:** `npm run test:e2e:api` (or `yarn test:e2e:api` / `pnpm test:e2e:api`)  
  Uses in-memory MongoDB when `mongodb-memory-server` is installed; otherwise set `MONGODB_URI` (e.g. Docker MongoDB). Install in-memory from repo root: `npm install -D mongodb-memory-server -w api` (or the equivalent with yarn/pnpm).
- **Web unit tests:** From root: `npm run test` (all unit tests), or from `apps/web`: `npm run test` / `yarn test` / `pnpm test`
- **Web E2E tests (Playwright):** `npm run test:e2e:web` (or `yarn test:e2e:web` / `pnpm test:e2e:web`)  
  Requires the app to be running (e.g. `npm run start:dev` or web preview + API dev). Optionally set `BASE_URL`. Install Playwright browsers: `npm run playwright:install` (or `yarn playwright:install` / `pnpm playwright:install`).
- **All unit tests from root:** `npm run test` / `yarn test` / `pnpm test`
- **Unit + API E2E (run everything that doesn’t need the app):** `npm run test:all` / `yarn test:all` / `pnpm test:all`
- **E2E from root:** `npm run test:e2e:api` or `npm run test:e2e:web` (and yarn/pnpm equivalents)

## Useful links

- [Turborepo docs](https://turbo.build/repo/docs) (tasks, caching, filtering)
