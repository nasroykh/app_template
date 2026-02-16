import { z } from "zod";
import { publicProcedure } from "../middleware";

export const healthRoutes = {
	check: publicProcedure
		.output(
			z.object({
				status: z.literal("healthy"),
				timestamp: z.string(),
				uptime: z.number(),
				environment: z.string(),
			})
		)
		.handler(async () => {
			return {
				status: "healthy" as const,
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				environment: process.env.NODE_ENV || "development",
			};
		}),
};
