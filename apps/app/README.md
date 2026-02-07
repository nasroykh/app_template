# Frontend Application

A modern frontend application built with **React 19**, **Vite**, and **TanStack Router**.

## Technologies

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Full type-safety)
- **State Management**:
  - **Server State**: [TanStack Query](https://tanstack.com/query) via `@orpc/tanstack-query`
  - **Global Client State**: [Jotai](https://jotai.org/)
- **API Client**: [ORPC Client](https://orpc.run/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Base UI](https://www.base-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://react-hot-toast.com/), [Vaul](https://vaul.emilkowal.ski/).
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Environment Variables

Ensure you have a `.env` file with the following:

- `VITE_API_URL`: Backend API URL (for production).
- `VITE_API_URL_DEV`: Backend API URL (for development).
- `VITE_IS_DEV`: Set to `true` during development.

## Getting Started

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:33460`.

### Building for Production

```bash
pnpm build
```

## Folder Structure

- `src/routes`: File-based routing (TanStack Router).
- `src/components`: UI components (including Shadcn-like primitives).
- `src/atoms`: Jotai atoms for global state.
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility libraries (ORPC client, auth setup, etc.).
- `src/index.css`: Tailwind CSS entry point.

## Type Safety

The application leverages **ORPC** to ensure that all API calls are fully typed based on the backend procedures. This eliminates a whole class of bugs and provides excellent developer experience.
