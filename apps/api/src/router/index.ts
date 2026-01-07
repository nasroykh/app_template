import { userRoutes } from "./routes/user.routes";

export const router = {
	users: userRoutes,
};

export type AppRouter = typeof router;
