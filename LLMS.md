# LLM Guide to the App Template Monorepo

This document serves as the primary entry point for LLMs working with this codebase. It outlines the project structure, technology stack, critical conventions, and development workflows.

**References:**

- [CLAUDE.md](./CLAUDE.md): Command reference and concise patterns.
- [README.md](./README.md): High-level project overview and feature list.
- [GEMINI.md](./GEMINI.md): Detailed architectural documentation and tech stack breakdown.

**Sub-Package Guides:**

- [API Backend (apps/api)](./apps/api/LLMS.md)
- [Frontend App (apps/app)](./apps/app/LLMS.md)
- [Database (packages/db)](./packages/db/LLMS.md)

## 1. Project Overview & Architecture

This is a high-performance **Turbo** monorepo using **pnpm workspaces**.

- **Package Manager**: `pnpm` (version >= 10.0.0)
- **Monorepo Tool**: `turborepo`
- **Language**: TypeScript (End-to-End Type Safety)

### Workspace Structure

| Path                     | Description             | Key Tech                                        |
| :----------------------- | :---------------------- | :---------------------------------------------- |
| `apps/api`               | Backend API Server      | Hono, Node.js, ORPC, Better Auth, Drizzle       |
| `apps/app`               | Frontend Web App        | React 19, Vite, TanStack Router, TanStack Query |
| `packages/db`            | Shared Database Library | Drizzle ORM, PostgreSQL, Zod Schemas            |
| `packages/tsconfig`      | Shared TS Configs       | `tsconfig.json` bases                           |
| `packages/eslint-config` | Shared Lint Configs     | ESLint 9 flat config                            |

## 2. Technology Stack

### Backend (`apps/api`)

- **Runtime**: Node.js (via `@hono/node-server`)
- **Framework**: Hono (lightweight, web-standards based)
- **API Layer**:
  - **ORPC**: Fully typed RPC-style API. Routes defined in `src/router`.
  - **Better Auth**: Handles authentication at `/auth/*`.
  - **OpenAPI/Scalar**: Auto-generated documentation at `/docs`.
- **Database**: Drizzle ORM (PostgreSQL).
- **Validation**: Zod (shared schemas).

### Frontend (`apps/app`)

- **Framework**: React 19 + Vite.
- **Routing**: **TanStack Router** (File-based: `src/routes`).
  - `_auth.tsx`: Layout for protected routes.
  - `_notauth.tsx`: Layout for public routes (login/register).
- **Data Fetching**: **TanStack Query** (integrated via ORPC).
- **Styling**: **Tailwind CSS 4** + Base UI + `shadcn`-like components.
- **State**:
  - Server State: TanStack Query.
  - Auth State: Better Auth (`useSession`).
  - Global Client State: Jotai.

### Shared Database (`packages/db`)

- **ORM**: Drizzle ORM.
- **Schema**: Defined in `src/models/*.ts`.
- **Migrations**: Managed via `drizzle-kit`.

## 3. Critical Development Patterns

### A. Authentication

- **Mechanism**: Better Auth (Cookies & Bearer Tokens).
- **Frontend**: Use `authClient` from `@/lib/auth`.
  - `const { data: session } = useSession();`
  - `await signIn.email({ ... })`
- **Backend**:
  - **ORPC**: Use `authProcedure` in `src/router/middleware.ts` to enforce auth.
  - **Hono**: Middleware registered in `src/plugins/auth.ts`.

### B. Type-Safe API (ORPC)

1.  **Define Route** in `apps/api/src/router/routes/` using `zod` for input/output.
    ```typescript
    export const myRoute = authProcedure
      .input(z.object({ id: z.string() }))
      .output(z.object({ success: z.boolean() }))
      .handler(async ({ input, context }) => { ... });
    ```
2.  **Export** in `apps/api/src/router/index.ts`.
3.  **Consume** in Frontend (`apps/app/src/routes/...`).
    ```typescript
    const { mutate } = orpc.myRoute.useMutation();
    // or
    const { data } = orpc.myRoute.useQuery({ input: { id: "123" } });
    ```

### C. Database Changes

1.  Modify schema in `packages/db/src/models/`.
2.  Run `pnpm db:generate`.
3.  Run `pnpm db:migrate` (prod) or `pnpm db:push` (dev).

## 4. Key Commands

| Action             | Command                               |
| :----------------- | :------------------------------------ |
| **Start Dev**      | `pnpm dev` (Runs all apps)            |
| **Start Frontend** | `pnpm --filter app dev`               |
| **Start Backend**  | `pnpm --filter api dev`               |
| **DB Studio**      | `pnpm db:studio`                      |
| **DB Migration**   | `pnpm db:generate && pnpm db:migrate` |
| **Lint**           | `pnpm lint`                           |
| **Skills**         | `pnpm skills:symlink:all`             |

## 5. Deployment

- **Frontend**: Static build (`pnpm build`). Deploy to Vercel/Netlify/S3.
- **Backend**: Node.js server (`pnpm build` -> `dist/index.js`). Deploy to VPS/Railway/Render.
- **Database**: PostgreSQL database required.
