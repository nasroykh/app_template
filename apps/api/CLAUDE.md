# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start with tsx watch (auto-reload)
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run production build
```

### Docker Commands

```bash
# Production deployment
docker-compose up --build -d

# Migrations run automatically on startup
docker-compose logs -f api

# Manual migration (if needed)
docker-compose exec api pnpm --filter @repo/db db:migrate

# Stop services
docker-compose down
```

**Note:** Use `pnpm dev` for local development. Docker is for production only.

## Architecture

Hono HTTP server with ORPC for type-safe RPC and Better Auth for authentication.

- **Entry**: `src/index.ts` — initializes DB, registers plugins, starts `@hono/node-server`
- **Plugins** (`src/plugins/`): Modular Hono middleware registration — CORS, ORPC handler, OpenAPI spec, Scalar docs UI, Better Auth handler
- **Router** (`src/router/`):
  - `middleware.ts`: Defines `publicProcedure`, `authProcedure`, `adminProcedure` with ORPC middleware chains
  - `routes/`: Route files using ORPC procedures. Each file exports a route group
  - `index.ts`: Aggregates all routes into `router` object, exports `AppRouter` type consumed by the frontend
- **Config** (`src/config/`): `env.ts` (environment variables), `auth.ts` (Better Auth config with Drizzle adapter), `nodemailer.ts` (email)
- **Services** (`src/services/`): Business logic layer

### Adding a Route

1. Create `src/router/routes/your.routes.ts`
2. Import a procedure from `../middleware` (`publicProcedure`, `authProcedure`, or `adminProcedure`)
3. Define route with `.input()` (Zod schema) and `.handler()`
4. Add to the router object in `src/router/index.ts`

The `AppRouter` type is exported via `package.json` `"./orpc"` export so the frontend can import it.
