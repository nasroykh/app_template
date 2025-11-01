import { authRouter } from "./routes/auth.routes";
import { organizationRouter } from "./routes/organization.routes";
import { userRouter } from "./routes/user.routes";
import { router } from "./trpc";

export const appRouter = router({
	auth: authRouter,
	user: userRouter,
	organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
