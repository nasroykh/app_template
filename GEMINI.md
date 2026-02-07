# GEMINI.md

## Project Overview

This is a high-performance full-stack web application starter kit built with a monorepo architecture using **pnpm workspaces**. It features a type-safe communication layer, robust authentication, payment integration, and a modern, responsive UI.

**Technologies:**

- **Frontend (`apps/app`):**

  - **Framework:** React 19, Vite, TypeScript
  - **Routing:** TanStack Router (Type-safe)
  - **State Management:**
    - Server state: TanStack React Query (via @orpc/tanstack-query)
    - Global client state: Jotai
  - **API Client:** ORPC Client (End-to-end type safety)
  - **Auth:** Better Auth
  - **Forms:** React Hook Form, Zod
  - **UI/Styling:** Tailwind CSS 4, Base UI Primitives, Lucide React
  - **Components:** Sonner (Toast), Vaul (Drawer), CMDK, Recharts, Embla Carousel
  - **Theme:** Next Themes

- **Backend (`apps/api`):**

  - **Runtime:** Node.js
  - **Framework:** Hono (running on @hono/node-server)
  - **Language:** TypeScript
  - **API:** ORPC (Type-safe), OpenAPI (Swagger) support
  - **Database:** Drizzle ORM
  - **Auth:** Better Auth
  - **Email:** Nodemailer

- **Database (`packages/db`):**
  - **Engine:** PostgreSQL
  - **ORM:** Drizzle ORM
  - **Tools:** Drizzle Kit (Migrations & Studio)
  - **Validation:** drizzle-zod

## Building and Running

### Prerequisites

- **Node.js**: >= 18
- **pnpm**: >= 10.0.0
- **Docker**: (Optional) For running local PostgreSQL/Redis

### Development

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**

    - Create a `.env` file in `apps/api` (refer to `.env.example`).
    - Create a `.env` file in `packages/db` (refer to `.env.example`).
    - Configure Database, Auth, Stripe, and SMTP details.

3.  **Start the development servers:**
    ```bash
    pnpm dev
    ```
    This starts the frontend, backend, and database services concurrently.
    - **Frontend**: `http://localhost:33460`
    - **Backend**: `http://localhost:33450`
    - **Swagger UI**: `http://localhost:33450/docs`

### Database Management

- **Generate migrations:**
  ```bash
  pnpm db:generate
  ```
- **Run migrations:**
  ```bash
  pnpm db:migrate
  ```
- **Push schema changes (dev):**
  ```bash
  pnpm db:push
  ```
- **Open Drizzle Studio:**
  ```bash
  pnpm --filter=@repo/db db:studio
  ```

### Production

- **Build:** `pnpm build`
- **Start:** `pnpm start`

## Development Conventions

- **Monorepo Structure**:
  - `apps/api`: Hono backend with ORPC routers.
  - `apps/app`: React frontend with TanStack Router.
  - `packages/db`: Shared Drizzle schema and database client.
- **Type Safety**: End-to-end type safety is maintained via **ORPC**, connecting Hono routers directly to React hooks.
- **Authentication**: Managed by **Better Auth**, which handles registration, login, and sessions.
- **Styling**: Uses **Tailwind CSS 4** for a modern utility-first approach with Base UI for accessibility.
- **Validation**: Shared **Zod** schemas between frontend and backend.
