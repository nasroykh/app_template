# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Vite dev server on :33460
pnpm build        # TypeScript check + Vite build
pnpm lint         # ESLint
```

## Architecture

React 19 + Vite + TanStack Router (file-based) + ORPC client + Tailwind CSS 4.

- **Routing** (`src/routes/`): TanStack Router file-based routing. Route tree auto-generated in `routeTree.gen.ts`
  - `_auth.tsx`: Layout route — checks session, redirects unauthenticated users to `/auth/login`
  - `_notauth.tsx`: Layout route — redirects authenticated users to `/`
  - Protected pages go under `_auth/`, guest pages under `_notauth/`
- **ORPC** (`src/lib/orpc.ts`): Type-safe API client importing `AppRouter` from `api/orpc`. Uses `createTanstackQueryUtils` for React Query integration. Call API via `orpc.routeName.methodName.queryOptions()`
- **Auth** (`src/lib/auth.ts`): Better Auth client
- **State**: Jotai atoms in `src/atoms/` for client state, TanStack Query for server state
- **UI**: Tailwind CSS 4 + Base UI primitives + shadcn-style components in `src/components/ui/`
- **Path alias**: `@/` maps to `src/`

### Adding a Page

Create a file in `src/routes/` following TanStack Router conventions:
- `_auth/dashboard.tsx` → protected route at `/dashboard`
- `_notauth/auth/login.tsx` → guest-only route at `/auth/login`
- `_auth/users/$userId.tsx` → dynamic param route
