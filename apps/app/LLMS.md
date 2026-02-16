# LLMS.md for Frontend App

**Context**: `apps/app`  
**Role**: Frontend Web Application  
**Stack**: React 19, Vite, TanStack Router, TanStack Query, ORPC Client, Tailwind CSS 4, Base UI

## Quick Overview

This is a modern React frontend with file-based routing (TanStack Router), end-to-end type-safe API communication (via ORPC), and a utility-first styling approach (Tailwind CSS 4).

## Key Patterns

### 1. Routing (TanStack Router)

- Routes are defined in `src/routes/` using file-based conventions.
- **Protected routes**: Go under `_auth/` (e.g., `_auth/dashboard.tsx` → `/dashboard`).
- **Public routes**: Go under `_notauth/` (e.g., `_notauth/auth/login.tsx` → `/auth/login`).
- **Dynamic params**: Use `$paramName.tsx` (e.g., `_auth/users/$userId.tsx` → `/users/:userId`).
- Route tree is auto-generated in `src/routes/routeTree.gen.ts`.

### 2. Type-Safe API Calls (ORPC + TanStack Query)

The `src/lib/orpc.ts` client imports the `AppRouter` type from the backend and exposes TanStack Query utilities.

**Query:**

```tsx
import { orpc } from "@/lib/orpc";

function MyComponent() {
	const { data, isLoading, error } = orpc.myFeature.doSomething.useQuery({
		input: { key: "value" },
	});

	// data is fully typed based on the backend output schema
}
```

**Mutation:**

```tsx
import { orpc } from "@/lib/orpc";

function MyComponent() {
	const { mutate, isPending } = orpc.myFeature.updateSomething.useMutation();

	const handleSubmit = (values) => {
		mutate({ input: values });
	};

	return <button onClick={handleSubmit}>Submit</button>;
}
```

**Example with query options:**

```tsx
import { orpc } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_auth/dashboard")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(
			orpc.myFeature.doSomething.queryOptions({
				input: { key: "value" },
			}),
		),
	component: DashboardComponent,
});

function DashboardComponent() {
	const { data } = useSuspenseQuery(
		orpc.myFeature.doSomething.queryOptions({
			input: { key: "value" },
		}),
	);

	const { mutate } = orpc.myFeature.doSomething.useMutation();
}
```

### 3. Authentication Status

```tsx
import { useSession } from "@/lib/auth";

function UserProfile() {
	const { data: session, isPending } = useSession();

	if (isPending) return <Skeleton />;
	if (!session) return null;

	return <div>{session.user.name}</div>;
}
```

### 4. Styling (Tailwind v4)

- Use utility classes directly: `className="flex flex-col gap-4 p-4"`.
- Configuration is in `index.css` (CSS variables) and `vite.config.ts` (rarely needed).

## Docker Deployment

The frontend is containerized for production deployment:

**Production Deployment:**

```bash
# From project root
docker-compose up --build -d

# Nginx serving optimized static build
# Health check available at /health
```

**Features:**

- ✅ Multi-stage Dockerfile (deps, build, production with Nginx)
- ✅ Optimized Nginx configuration with gzip, caching, and security headers
- ✅ TanStack Router support (serves index.html for all routes)
- ✅ API proxy at `/api` to backend service
- ✅ Health endpoint at `/health`
- ✅ Non-root user execution

**Container Details:**

- Production: `~50-80MB` Alpine Nginx image
- Port: `33460`

**Manual Operations:**

```bash
# View logs
docker-compose logs -f app

# Rebuild image
docker-compose build app

# Stop services
docker-compose down
```

**Note:** For local development, use `pnpm dev` directly on your host machine. Docker is configured for production deployments only.
