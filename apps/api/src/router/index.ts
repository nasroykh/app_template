import { userRoutes } from "./routes/user.routes";
import { organizationRoutes } from "./routes/organization.routes";

export const router = {
	users: userRoutes,
	organization: organizationRoutes,
};

export type AppRouter = typeof router;
