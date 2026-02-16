# API Documentation for LLMs

**Context**: `apps/api`
**Role**: Backend API Server
**Stack**: Node.js, Hono, ORPC, Better Auth, Drizzle, Zod

## Architecture

- **Server**: Hono running on Node.js (`@hono/node-server`).
- **Communication**:
  - **ORPC**: Type-safe RPC for business logic (`src/router`).
  - **Better Auth**: Authentication endpoints at `/auth/*` (`src/plugins/auth.ts`).
  - **OpenAPI/Scalar**: Documentation at `/docs` (`src/plugins/openapi.ts`).

## Directory Structure

- `src/index.ts`: Entry point. Setup Hono, middleware, and plugins.
- `src/router/`: ORPC router definitions.
  - `middleware.ts`: Defines `publicProcedure`, `authProcedure`, `adminProcedure`.
  - `routes/`: Individual route modules (e.g., `organization.routes.ts`).
  - `index.ts`: Aggregates all routes into `appRouter`.
- `src/plugins/`: Hono plugins (Auth, CORS, OpenAPI).
- `src/services/`: Business logic helper functions (Email, etc.).
- `src/config/`: Configuration (Env, Auth options).

## Development Workflows

### 1. Adding a New API Route (ORPC)

1.  **Create Route File**: `src/router/routes/my-feature.routes.ts`

    ```typescript
    import { z } from "zod";
    import { authProcedure } from "../middleware";

    export const myFeatureRoutes = {
    	doSomething: authProcedure
    		.input(z.object({ key: z.string() }))
    		.output(z.object({ result: z.string() }))
    		.handler(async ({ input, context }) => {
    			// access user via context.user
    			return { result: "ok" };
    		}),
    };
    ```

2.  **Register Route**: Add to `src/router/index.ts`

    ```typescript
    import { myFeatureRoutes } from "./routes/my-feature.routes";

    export const router = os.router({
    	// ... existing routes
    	myFeature: myFeatureRoutes,
    });
    ```

### 2. Authentication

- **Configuration**: `src/config/auth.ts`
- **User/Session**: Accessed via `context.user` and `context.session` in `authProcedure`.
- **Database Hooks**: Post-registration logic (e.g., creating default org) is in `auth.ts` under `databaseHooks`.

### 3. Environment Variables

- Defined in `.env` (gitignored) and `src/config/env.ts` (validation).
- To add a new var: Update `.env.example`, add to `.env`, and update Zod schema in `src/config/env.ts`.

## Docker Deployment

This API service is containerized for production deployment with automatic migration support:

**Production Deployment:**

```bash
# From project root
docker-compose up --build -d

# Migrations run automatically on container startup
# Entrypoint script: apps/api/docker-entrypoint.sh
```

**Features:**

- ✅ Automatic database migrations on production startup
- ✅ Health checks at `/api/v1/health`
- ✅ Multi-stage Dockerfile for optimized images (~150-200MB)
- ✅ PostgreSQL client included for `pg_isready`
- ✅ Non-root user execution for security

**Manual Operations:**

```bash
# View logs
docker-compose logs -f api

# Run migrations manually
docker-compose exec api pnpm --filter @repo/db db:migrate

# Access container shell
docker-compose exec api sh

# Stop services
docker-compose down
```

**Note:** For local development, use `pnpm dev` directly on your host machine. Docker is configured for production deployments only.
