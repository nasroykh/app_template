# App Template - High-Performance Full-Stack Starter Kit

A comprehensive, type-safe full-stack web application starter kit built with a monorepo architecture.

## Project Overview

This project is a monorepo using **pnpm workspaces**, featuring a React frontend, a Hono backend, and a shared PostgreSQL/Drizzle database package.

**Key Technologies:**

- **Frontend:** React 19, Vite, TypeScript, TanStack Router, TanStack Query, ORPC Client, Tailwind CSS 4, Radix UI.
- **Backend:** Node.js, Hono, ORPC, Better Auth, PostgreSQL, Drizzle ORM.
- **Database:** PostgreSQL, Drizzle ORM, Drizzle Kit.

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

3.  **Run Development Mode:**
    ```bash
    pnpm dev
    ```
    - **Frontend**: `http://localhost:33460`
    - **Backend**: `http://localhost:33450`
    - **Swagger UI**: `http://localhost:33450/docs`

## Features

- **End-to-End Type Safety**: Shared types between backend and frontend via ORPC.
- **Robust Authentication**: Powered by Better Auth with support for multiple providers and sessions.
- **Modern Styling**: Utility-first styling with Tailwind CSS 4 and accessible components from Radix UI.
- **Type-Safe Routing**: Routing with TanStack Router.
- **Database Management**: Easy migrations and schema management with Drizzle ORM and Drizzle Kit.

## Structure

- `apps/api`: Hono-based backend API.
- `apps/app`: React-based frontend application.
- `packages/db`: Shared database schema and Drizzle client.

## Scripts

- `pnpm dev`: Start all services in development mode.
- `pnpm build`: Build all packages for production.
- `pnpm db:generate`: Generate database migrations.
- `pnpm db:migrate`: Run database migrations.
- `pnpm db:push`: Push local schema changes to the database.

---

For more detailed information, please refer to [GEMINI.md](./GEMINI.md).
