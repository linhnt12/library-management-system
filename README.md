Library Management System

A monorepo-style Next.js application that includes both the frontend (UI) and backend (API routes) in a single codebase. Backend lives under `src/app/api` and is served by the same Next.js server.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Docker and Docker Compose (recommended for the database)

## 1) Clone and Install

```bash
git clone <your-repo-url>
cd library-management-system
# choose one package manager
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

## 2) Environment Variables

Create an `.env` file in the project root. Minimum variables:

```bash
# Example for Postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/library?schema=public"
```

## 3) Start the Database (via Docker)

```bash
docker compose up -d
```

This will provision the database defined in `docker-compose.yml`.

## 4) Initialize Prisma (Backend Data Layer)

```bash
npx prisma generate
npx prisma migrate dev --name init
# optional: seed if you have a seed script
# npx prisma db seed
```

## 5) Run in Development (Frontend + Backend)

Both frontend and backend run from the same Next.js dev server.

```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open `http://localhost:3000` in your browser. The API is available under `/api`, for example:

```bash
curl http://localhost:3000/api/books
```

## 6) Build and Run in Production

```bash
npm run build
npm run start
# or the corresponding yarn/pnpm/bun commands
```

By default the app listens on port 3000. Ensure the same `.env` is available in production with a reachable `DATABASE_URL`.

## Project Structure (Highlights)

- `src/app` — Next.js App Router
  - `src/app/api` — Backend API routes
  - `src/app/(auth)`, `src/app/admin`, `src/app/librarian` — Frontend routes
- `prisma/schema.prisma` — Data models
- `docker-compose.yml` — Local database services

## Troubleshooting

- If migrations fail, verify `DATABASE_URL` and that the database container is running.
- If API requests fail, check server logs and confirm Prisma client is generated.
- Delete `.next/` and re-run `npm run dev` if hot reload behaves unexpectedly.
