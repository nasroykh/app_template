# API Service

This is the backend service for the application, built with **Hono** and **ORPC**.

## Technologies

- **Framework**: [Hono](https://hono.dev/) running on `@hono/node-server`.
- **API Engine**: [ORPC](https://orpc.run/) for type-safe procedures with OpenAPI/Scalar support.
- **Authentication**: [Better Auth](https://www.better-auth.com/) with Drizzle adapter.
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) (using `@repo/db` package).
- **Email**: [Nodemailer](https://nodemailer.com/).
- **Validation**: [Zod](https://zod.dev/).

## Getting Started

### Environment Variables

Ensure you have a `.env` file with the following:

- `PORT`: Port the server will listen on (default 33450).
- `DB_URL`: PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: Secret for auth sessions.
- `SMTP_*`: SMTP configuration for emails.

### Development

```bash
pnpm dev          # Start with tsx watch (auto-reload)
```

### Production

```bash
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run production build
```

### Docker

The API is fully containerized for production. **It is highly recommended to use the `Makefile` at the project root** for all Docker operations.

**Production Deployment (from root):**

```bash
make up          # Build and start
make logs-api    # Watch migrations and API logs
```

**Manual Operations (from root):**

```bash
make migrate     # Run migrations manually
make shell-api   # Access container terminal
make down        # Stop services
```

Alternatively, using Docker Compose directly:

```bash
docker-compose up --build -d
docker-compose logs -f api
```

**Note:** For local development, use `pnpm dev` directly on your host machine. Docker is configured for production deployments only.

## Architecture

- `src/index.ts`: Entry point — initializes DB, registers plugins (CORS, ORPC, OpenAPI/Scalar, Auth), serves on `@hono/node-server`.
- `src/config/`: Environment and service configurations (`env.ts`, `auth.ts`, `nodemailer.ts`).
- `src/plugins/`: Modular Hono middleware registration — CORS, ORPC handler, OpenAPI spec, Scalar docs UI, Better Auth handler.
- `src/router/`: ORPC routers and procedure definitions.
  - `middleware.ts`: Defines `publicProcedure`, `authProcedure`, `adminProcedure` with ORPC middleware chains that add auth context.
  - `routes/`: Route files using ORPC procedures. Each file exports a route group.
  - `index.ts`: Aggregates all routes into `router` object, exports `AppRouter` type consumed by the frontend.
- `src/services/`: Business logic and external service integrations.
- `src/utils/`: Helper functions.

### Adding a Route

1. Create `src/router/routes/your.routes.ts`
2. Import a procedure from `../middleware` (`publicProcedure`, `authProcedure`, or `adminProcedure`)
3. Define route with `.input()` (Zod schema) and `.handler()`
4. Add to the router object in `src/router/index.ts`

The `AppRouter` type is exported via `package.json` `"./orpc"` export so the frontend can import it for end-to-end type safety.

## API Documentation

When running in development, you can access the Swagger UI at `http://localhost:33450/docs`.
