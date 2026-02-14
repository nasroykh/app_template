# App Documentation for LLMs

**Context**: `apps/app`
**Role**: Frontend Web Application
**Stack**: React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS 4

## Architecture

- **Routing**: File-based routing via **TanStack Router** (`src/routes`).
- **Data Fetching**: **ORPC** client w/ TanStack Query integration.
- **State**:
  - **Server**: TanStack Query (via ORPC).
  - **Auth**: Better Auth (`useSession`).
  - **Client**: Jotai atoms.
- **Styling**: Tailwind CSS 4, Base UI, `shadcn` components.

## Directory Structure

- `src/routes/`: Route definitions.
  - `__root.tsx`: Root layout.
  - `_auth.tsx`: Layout for authenticated routes (checks session).
  - `_notauth.tsx`: Layout for guest routes (login/register).
- `src/components/`:
  - `ui/`: Reusable UI components (buttons, inputs).
  - `audit/`, `common/`: Feature-specific components.
- `src/lib/`:
  - `orpc.ts`: ORPC client setup.
  - `auth.ts`: Better Auth client setup.
  - `utils.ts`: Helper functions (cn, etc.).
- `src/hooks/`: Custom React hooks.

## Development Workflows

### 1. Adding a New Page

1.  **Create File**: `src/routes/_auth/my-page.tsx` (for protected page).
2.  **Export Component**:

    ```tsx
    import { createFileRoute } from "@tanstack/react-router";

    export const Route = createFileRoute("/_auth/my-page")({
    	component: MyPage,
    });

    function MyPage() {
    	return <div>Hello World</div>;
    }
    ```

3.  **Link**: Use `<Link to="/my-page" />` from `@tanstack/react-router`.

### 2. Consuming API (ORPC)

```tsx
import { orpc } from "@/lib/orpc";

function MyComponent() {
	const { data } = orpc.myFeature.doSomething.useQuery({
		input: { key: "value" },
	});

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
