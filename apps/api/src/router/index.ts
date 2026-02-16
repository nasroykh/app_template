import { userRoutes } from "./routes/user.routes";
import { organizationRoutes } from "./routes/organization.routes";
import { healthRoutes } from "./routes/health.routes";

export const router = {
	health: healthRoutes,
	users: userRoutes,
	organization: organizationRoutes,
};

export type AppRouter = typeof router;
