import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { db, user } from "@repo/db";
import { userSelectSchema as userSelectSchemaRaw } from "@repo/db/types";
import { eq } from "@repo/db/drizzle-orm";

import { authProcedure } from "../middleware.js";

const userSelectSchema = userSelectSchemaRaw as z.ZodSchema<
	z.infer<typeof userSelectSchemaRaw>
>;

export const userRoutes = {
	list: authProcedure
		.route({
			method: "GET",
			path: "/users",
			description: "List all users",
		})
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).optional().default(10),
				offset: z.number().int().min(0).optional().default(0),
				page: z.number().int().min(1).optional().default(1),
			})
		)
		.output(z.array(userSelectSchema))
		.handler(async ({ input }) => {
			const users = await db
				.select()
				.from(user)
				.limit(input.limit)
				.offset(input.offset);
			return users;
		}),
	find: authProcedure
		.route({
			method: "GET",
			path: "/users/{id}",
			description: "Find a user by ID",
		})
		.input(z.object({ id: z.string() }))
		.output(userSelectSchema)
		.handler(async ({ input }) => {
			const [foundUser] = await db
				.select()
				.from(user)
				.where(eq(user.id, input.id))
				.limit(1);
			if (!foundUser) {
				throw new ORPCError("NOT_FOUND", { message: "User not found" });
			}
			return foundUser;
		}),
};
