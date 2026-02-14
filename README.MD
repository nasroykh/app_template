# App Template - High-Performance Full-Stack Starter Kit

A comprehensive, type-safe full-stack web application starter kit built with a monorepo architecture.

## Project Overview

This project is a monorepo using **pnpm workspaces** + **Turborepo**, featuring a React frontend, a Hono backend, and a shared PostgreSQL/Drizzle database package.

**Key Technologies:**

- **Frontend:** React 19, Vite, TypeScript, TanStack Router, TanStack Query, ORPC Client, Tailwind CSS 4, Base UI, Tabler Icons, Jotai, shadcn-style components.
- **Backend:** Node.js, Hono, ORPC, Better Auth, PostgreSQL, Drizzle ORM, Nodemailer.
- **Database:** PostgreSQL, Drizzle ORM, Drizzle Kit, Zod (via drizzle-zod).
- **Validation:** Zod 4 across both frontend and backend.

## Getting Started

### Prerequisites

- **Node.js**: >= 18
- **pnpm**: >= 10.0.0
- **Docker**: (Optional) For running local PostgreSQL/Redis

### Installation

1.  **Clone and Install:**

    ```bash
    pnpm install
    ```

2.  **Environment Setup:**
    - Configure `.env` files in `apps/api` and `packages/db` based on their `.env.example` templates.
    - Configure Database, Auth, and SMTP details.

3.  **Generate Auth Schema (if needed):**

    ```bash
    pnpm auth:generate
    ```

4.  **Run Development Mode:**
    ```bash
    pnpm dev
    ```

    - **Frontend**: `http://localhost:33460`
    - **Backend**: `http://localhost:33450`
    - **Swagger UI**: `http://localhost:33450/docs`

## Features

- **End-to-End Type Safety**: Shared types between backend and frontend via ORPC. Backend route types flow to frontend via `AppRouter` type export → ORPC client → TanStack Query hooks.
- **Robust Authentication**: Powered by Better Auth with native Hono integration, email OTP verification, organization support, and admin roles. Supports both **cookie-based sessions** and **Bearer tokens**. Auth endpoints served directly at `/auth/*`, with typed `authClient` on the frontend.
- **Modern Styling**: Utility-first styling with Tailwind CSS 4, accessible components from Base UI, and shadcn-style UI primitives.
- **Type-Safe Routing**: File-based routing with TanStack Router, including protected (`_auth`) and guest-only (`_notauth`) layout routes.
- **Database Management**: Easy migrations and schema management with Drizzle ORM and Drizzle Kit.
- **State Management**: Server state via TanStack Query/ORPC, auth session state via Better Auth's `useSession()`, other client state via Jotai.

## Structure

- `apps/api`: Hono-based backend API with ORPC routers and services.
- `apps/app`: React-based frontend application with TanStack Router.
- `packages/db`: Shared database schema, Drizzle client, models, and types.
- `packages/tsconfig`: Shared TypeScript configuration.
- `packages/eslint-config`: Shared ESLint configuration.

## Scripts

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all services (frontend :33460, backend :33450)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm start            # Run production build

# Database (runs against packages/db)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes directly (dev only)
pnpm auth:generate    # Regenerate Better Auth schema into packages/db

# Run a single app
pnpm --filter api dev
pnpm --filter app dev
pnpm --filter @repo/db db:studio   # Open Drizzle Studio

# Skills (for AI agents)
pnpm skills:symlink:all   # Symlink skills to .claude, .cursor, and .agent directories
```

## Development Conventions

- **Adding an API route**: Create file in `apps/api/src/router/routes/`, use `publicProcedure`/`authProcedure`/`adminProcedure` from `middleware.ts`, add to router in `router/index.ts`.
- **Adding a page**: Create file in `apps/app/src/routes/` following TanStack Router file conventions. Put under `_auth/` for protected pages, `_notauth/` for guest-only pages.
- **DB schema changes**: Edit models in `packages/db/src/models/`, run `pnpm db:generate` then `pnpm db:migrate`.
- **Validation**: Shared Zod schemas between frontend and backend for input validation and data integrity.
- **API Design**: Routes follow a structured pattern with `PREFIX` (e.g., `/api/v1`) and categorization.

---

For more detailed information, refer to [GEMINI.md](./GEMINI.md) and [CLAUDE.md](./CLAUDE.md).
