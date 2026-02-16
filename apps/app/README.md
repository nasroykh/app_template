# Frontend Application

A modern frontend application built with **React 19**, **Vite**, and **TanStack Router**.

## Technologies

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) with SWC
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based, full type-safety)
- **State Management**:
  - **Server State**: [TanStack Query](https://tanstack.com/query) via `@orpc/tanstack-query`
  - **Global Client State**: [Jotai](https://jotai.org/)
- **API Client**: [ORPC Client](https://orpc.run/) — imports `AppRouter` type from backend for end-to-end type safety
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Base UI](https://www.base-ui.com/) primitives, shadcn-style components in `src/components/ui/`
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Other**: [Sonner](https://sonner.emilkowal.dev/) (Toasts), [Vaul](https://vaul.emilkowal.ski/) (Drawer), [CMDK](https://cmdk.paco.me/) (Command Palette), [Embla Carousel](https://www.embla-carousel.com/), [Next Themes](https://github.com/pacocoursey/next-themes)
- **Path Alias**: `@/` maps to `src/`

## Environment Variables

Ensure you have a `.env` file with the following:

- `VITE_API_URL`: Backend API URL (for production).
- `VITE_API_URL_DEV`: Backend API URL (for development).
- `VITE_IS_DEV`: Set to `true` during development.

## Getting Started

### Development

```bash
pnpm dev          # Vite dev server on :33460
pnpm build        # TypeScript check + Vite build
pnpm lint         # ESLint
```

The app will be available at `http://localhost:33460`.

### Docker

The app is containerized for production using Nginx. **It is highly recommended to use the `Makefile` at the project root** for all Docker operations.

**Production Deployment (from root):**

```bash
make up          # Build and start
make logs-app    # View frontend logs
```

**Manual Operations (from root):**

```bash
make shell-app   # Access container terminal
make down        # Stop services
```

Alternatively, using Docker Compose directly:

```bash
docker-compose up --build -d
docker-compose logs -f app
```

**Note:** For local development, use `pnpm dev` directly on your host machine. Docker is configured for production deployments only.

## Architecture

- `src/routes/`: File-based routing (TanStack Router). Route tree auto-generated in `routeTree.gen.ts`.
  - `_auth.tsx`: Layout route — checks session, redirects unauthenticated users to `/auth/login`.
  - `_notauth.tsx`: Layout route — redirects authenticated users to `/`.
  - Protected pages go under `_auth/`, guest-only pages under `_notauth/`.
- `src/lib/`: Utility libraries.
  - `orpc.ts`: Type-safe API client using `createTanstackQueryUtils` for React Query integration. Call API via `orpc.routeName.methodName.queryOptions()`.
  - `auth.ts`: Better Auth client.
- `src/components/`: UI components (including shadcn-style primitives in `ui/`).
- `src/atoms/`: Jotai atoms for global client state.
- `src/hooks/`: Custom React hooks.
- `src/index.css`: Tailwind CSS entry point.

### Adding a Page

Create a file in `src/routes/` following TanStack Router conventions:

- `_auth/dashboard.tsx` → protected route at `/dashboard`
- `_notauth/auth/login.tsx` → guest-only route at `/auth/login`
- `_auth/users/$userId.tsx` → dynamic param route

## Type Safety

The application leverages **ORPC** to ensure that all API calls are fully typed based on the backend procedures. This eliminates a whole class of bugs and provides excellent developer experience.
