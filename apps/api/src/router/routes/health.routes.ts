import { z } from "zod";
import { publicProcedure } from "../middleware";
import { env } from "../../config/env";

export const PREFIX = env.API_V1_PREFIX as `/${string}`;

export const healthRoutes = {
	check: publicProcedure
		.route({
			method: "GET",
			path: `${PREFIX}/health/check`,
			description: "Check API health",
		})
		.output(
			z.object({
				status: z.literal("healthy"),
				timestamp: z.string(),
				uptime: z.number(),
				environment: z.string(),
			}),
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
