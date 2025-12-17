# GEMINI.md

## Project Overview

This is a full-stack web application built with a monorepo architecture using pnpm workspaces. It serves as a comprehensive starter kit featuring authentication, payments, background jobs, and a modern UI.

**Technologies:**

- **Frontend (`apps/app`):**

  - **Framework:** React, Vite, TypeScript
  - **Routing:** TanStack Router
  - **State Management:** TanStack React Query (Server), Jotai (Client)
  - **API Client:** ORPC Client
  - **Auth:** Better Auth
  - **Forms:** React Hook Form, Zod
  - **UI/Styling:** Tailwind CSS, Radix UI, Lucide React
  - **Components:** Sonner (Toast), Vaul (Drawer), CMDK, Recharts, Embla Carousel
  - **Theme:** Next Themes

- **Backend (`apps/api`):**

  - **Runtime:** Node.js
  - **Framework:** Hono
  - **Language:** TypeScript
  - **API:** ORPC, Hono OpenAPI
  - **Database:** PostgreSQL, Drizzle ORM
  - **Auth:** Better Auth
  - **Payments:** Stripe
  - **Email:** Nodemailer

- **Database (`packages/db`):**
  - PostgreSQL
  - Drizzle ORM
  - Drizzle Kit (Migrations)
  - drizzle-zod

## Building and Running

### Prerequisites

- Node.js (>=18)
- pnpm (>=10.0.0)
- Docker (for running local PostgreSQL)

### Development

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**

    - Create a `.env` file in `apps/api` by copying `.env.example`.
    - Configure the following sections:
      - **Database:** Connection details for PostgreSQL.
      - **Auth:** Better Auth secret and admin credentials.
      - **Stripe:** API keys for payments.
      - **SMTP:** Email server details.
      - **App:** URLs and ports.

3.  **Start the development servers:**

    ```bash
    pnpm dev
    ```

    This starts the frontend, backend, and database services.

    - Frontend: `http://localhost:33460` (Default)
    - Backend: `http://localhost:33450` (Default)
    - Swagger UI: `http://localhost:33450/docs`

### Database Migrations

- **Generate migrations:**

  ```bash
  pnpm --filter=db db:generate
  ```

- **Run migrations:**

  ```bash
  pnpm --filter=db db:migrate
  ```

- **Push schema changes (for development):**

  ```bash
  pnpm --filter=db db:push
  ```

- **Open Drizzle Studio:**
  ```bash
  pnpm --filter=db db:studio
  ```

### Building for Production

```bash
pnpm build
```

### Starting in Production

```bash
pnpm start
```

## Development Conventions

- **Monorepo:** Organized with `apps` (api, app) and `packages` (db) using pnpm workspaces.
- **ORPC:** Primary communication layer between frontend and backend, ensuring end-to-end type safety.
- **Authentication:** Managed via **Better Auth**, integrating with Stripe for subscriptions.
- **State Management:**
  - Server state: **TanStack React Query**.
  - Global client state: **Jotai**.
- **Styling:** **Tailwind CSS** with **Radix UI** primitives for accessible components.
- **Database:** **Drizzle ORM** for type-safe database interactions. Schema defined in `packages/db`.
- **Background Jobs:** Handled by **BullMQ** backed by **Redis**.
