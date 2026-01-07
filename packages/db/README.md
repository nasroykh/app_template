# Database Package

Shared database package providing the **Drizzle ORM** client and schema definitions for the entire monorepo.

## Technologies

- **Database Engine**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Migration Tool**: [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- **Validation**: [Drizzle Zod](https://orm.drizzle.team/docs/zod)

## Setup

Ensure you have a `.env` file with the following:

- `DB_URL`: PostgreSQL connection string.
- `DB_USER`: Database user.
- `DB_PASSWORD`: Database password.
- `DB_HOST`: Database host.
- `DB_PORT`: Database port.
- `DB_NAME`: Database name.
- `DB_SSL_MODE`: Database SSL mode (e.g., `disable`).

## Scripts

Execute these scripts from the root using `pnpm --filter=@repo/db <script>` or directly in this folder.

- `pnpm db:generate`: Generate SQL migration files based on schema changes.
- `pnpm db:migrate`: Apply pending migrations to the database.
- `pnpm db:push`: Push local schema changes directly to the database (best for development).
- `pnpm db:studio`: Launch Drizzle Studio to explore and manage your data visually.

## Directory Structure

- `src/index.ts`: Database client initialization.
- `src/schema.ts`: Main schema entry point (exports all models).
- `src/models/`: Individual model definitions (e.g., Auth schema).
- `drizzle/`: Generated SQL migration files.

## Usage

This package is used by:

- `apps/api`: To perform database operations.
- `apps/app`: Indirectly via API procedures.
