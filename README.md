# Easygenerator – Full Stack Auth

Monorepo: **API** (NestJS + MongoDB) and **Web** (React + Vite). No env files are required for a quick run; sensible defaults are built in.

## Table of contents

- [Live Demo](#live-demo)
- [Principles](#principles)
- [Technical Decisions](#technical-decisions--justifications)
- [Scope](#scope)
- [Requirements](#requirements)
- [Package manager](#package-manager)
- [Setup and run](#setup-and-run)
- [Testing](#testing)

## Live Demo

> ⚠️ **Note:** This demo is served over **HTTP** not **HTTPS**. 
> Some platforms (including GitHub) may try to auto-upgrade links to HTTPS.
> <br> If the link doesn’t load when clicked, **remove the `s` from `https`** in the address bar.

**[Live Demo](http://srv989705.hstgr.cloud:8080/)** — Deployed on my personal VPS. Try it out.

<img width="1920" height="957" alt="image" src="https://github.com/user-attachments/assets/7a8e8e51-4cfe-4515-97ac-51417b8d4f90" />

## Principles

- **Monorepo:** [Turborepo](https://turbo.build/repo) with `apps/api` (NestJS + MongoDB), `apps/web` (React + Vite), and `packages/api-contract` (OpenAPI schema and generated types for the frontend).
- **Auth:** Cookie-based sessions only: httpOnly `access_token` and `refresh_token`; refresh path-restricted; no auth state in `localStorage`.
- **Security:** The project uses a **Dual-Token Rotation** strategy with **httpOnly** cookies: access and refresh tokens are stored only in httpOnly cookies, the refresh token is path-scoped to `/api/auth/refresh` and rotated on refresh; no tokens in `localStorage` or client-side JS.
- **Contract:** API surface is described by OpenAPI; the web app uses `openapi-fetch` and types generated from `api-contract`.
- **CI/CD:** Automated pipeline in `.github/workflows/ci.yml` runs on push/PR to `main`: install, lint, build, unit tests, and e2e tests (API and web); MongoDB is provided via a GitHub Actions service container for API e2e. CI uses pnpm; local usage works with npm, Yarn, or pnpm.
- **Defaults:** The app runs with `npm install` / `yarn` / `pnpm install` and `npm run start:dev` (or `yarn start:dev` / `pnpm start:dev`) with Docker MongoDB; env is optional for overrides.

## Technical Decisions & Justifications

Reasoning behind key choices:

- **httpOnly cookies** — Access and refresh tokens live only in httpOnly cookies (never in `localStorage` or client JS). This mitigates XSS: injected script cannot read tokens. Combined with SameSite and optional CSRF measures, we get defense-in-depth. Rotating the refresh token on use limits the impact of token leakage.
- **Refresh token path-restricted to `/api/auth/refresh`** — The refresh cookie is scoped with `Path=/api/auth/refresh`, so the browser sends it only to that endpoint. Attack surface is reduced: even if an attacker obtains a reflected XSS or similar, the cookie is not sent to arbitrary API routes—only to the dedicated refresh endpoint.
- **openapi-fetch for type-safe API calls** — The web app uses `openapi-fetch` with types generated from the OpenAPI schema in `api-contract`. We get end-to-end type safety from schema to client (paths, request/response types) with no runtime overhead and no hand-maintained DTOs. Changes to the API surface show up as compile-time errors in the frontend.
- **TanStack Router `beforeLoad` for auth** — Auth checks run in route `beforeLoad` so we resolve session and redirects before any component renders. This prevents FOUC (Flash of Unauthenticated Content): users do not see a brief “logged out” state before the app redirects to login.
- **pnpm for dependency management** — pnpm gives fast, disk-efficient installs and strict dependency resolution (no phantom dependencies). The lock file is deterministic and CI/local installs stay consistent. It's the default choice here, though the repo works fine with npm, Yarn, or Bun.

## Scope

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)
- `GET /api/users` and `GET /api/users/:id` (protected)

Authentication is cookie-based with `httpOnly` cookies:

- `access_token` for authenticated API requests
- `refresh_token` for token rotation (`Path=/api/auth/refresh`)


## Requirements

- **Node** ≥18
- **pnpm**, **npm**, **Yarn**, or **Bun**
- **Docker** (for MongoDB in dev and for the full prod stack)

## Package manager

All root scripts use Turborepo and work with **pnpm**, **npm**, **Yarn**, or **Bun**. Use the same commands with your preferred manager (e.g. `pnpm start:dev`, `npm run start:dev`, `yarn start:dev`, or `bun run start:dev`).

## Setup and run

**Clone and install:**

```sh
git clone <repo-url>
cd <repo>
pnpm install
# or: npm install
# or: yarn
# or: bun install
```

**Development:** Start MongoDB, then run API and web via Turbo.

```sh
pnpm db:up
pnpm start:dev
# or: npm run db:up && npm run start:dev
# or: yarn db:up && yarn start:dev
# or: bun run db:up && bun run start:dev
```

- **API:** http://localhost:3000
- **Web:** http://localhost:5173 (proxies `/api` to the API)

**Production (all in Docker):**

```sh
pnpm start:prod
# or: npm run start:prod
# or: yarn start:prod
# or: bun run start:prod
```

- App: http://localhost:8080 (override with `GATEWAY_PORT` in `.env` if needed)

**Optional env:** Copy `.env.example` to `.env` at the repo root and `apps/api/.env.example` to `apps/api/.env`. Main variables:

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `GATEWAY_PORT`          | Host port for the prod gateway (default `8080`) |
| `MONGO_INITDB_DATABASE` | MongoDB database name (e.g. `easygenerator`)    |
| `MONGODB_URI`           | MongoDB connection string (API)                 |
| `JWT_SECRET`            | Secret for JWT signing (API)                    |
| `PORT`                  | API port (default `3000`)                       |
| `NODE_ENV`              | `development` or `production`                   |

## Testing

Use the same root scripts with pnpm, npm, Yarn, or Bun (e.g. `pnpm test`, `npm run test`, `yarn test:e2e:api`, `bun run test:all`).

- **API unit tests:** `pnpm test` (runs all unit tests) or run from `apps/api`: `pnpm test` / `npm run test` / `yarn test` / `bun test`
- **API E2E tests:** `pnpm test:e2e:api` (or `npm run test:e2e:api` / `yarn test:e2e:api` / `bun run test:e2e:api`)  
  Uses in-memory MongoDB when `mongodb-memory-server` is installed; otherwise set `MONGODB_URI` (e.g. Docker MongoDB). Install in-memory from repo root: `pnpm add -D -w api mongodb-memory-server` (or the equivalent with npm/yarn/bun).
- **Web unit tests:** From root: `pnpm test` (all unit tests), or from `apps/web`: `pnpm test` / `npm run test` / `yarn test` / `bun test`
- **Web E2E tests (Playwright):** `pnpm test:e2e:web` (or `npm run test:e2e:web` / `yarn test:e2e:web` / `bun run test:e2e:web`)  
  Requires the app to be running (e.g. `pnpm start:dev` or web preview + API dev). Optionally set `BASE_URL`. Install Playwright browsers: `pnpm playwright:install` (or `npm run playwright:install` / `yarn playwright:install` / `bun run playwright:install`).
- **All unit tests from root:** `pnpm test` / `npm run test` / `yarn test` / `bun test`
- **Unit + API E2E (run everything that doesn’t need the app):** `pnpm test:all` / `npm run test:all` / `yarn test:all` / `bun run test:all`
- **E2E from root:** `pnpm test:e2e:api` or `pnpm test:e2e:web` (and npm/yarn/bun equivalents)
