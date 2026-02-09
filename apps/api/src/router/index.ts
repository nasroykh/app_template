import { userRoutes } from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import { organizationRoutes } from "./routes/organization.routes";

export const router = {
	users: userRoutes,
	auth: authRoutes,
	organization: organizationRoutes,
};

export type AppRouter = typeof router;
