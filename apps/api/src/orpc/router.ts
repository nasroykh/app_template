import * as z from "zod";
import { os } from "@orpc/server";
import { auth } from "../utils/auth";
import { ORPCError } from "@orpc/server";

export const base = os.$context<{ headers: Headers }>();

export const authMiddleware = base.middleware(async ({ context, next }) => {
	const sessionData = await auth.api.getSession({
		headers: context.headers,
	});

	if (!sessionData?.session || !sessionData?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	// Adds session and user to the context
	return next({
		context: {
			session: sessionData.session,
			user: sessionData.user,
		},
	});
});

export const listPlanet = base.use(authMiddleware)
	.input(
		z.object({
			limit: z.number().int().min(1).max(100).optional(),
			cursor: z.number().int().min(0).default(0),
		})
	)
	.handler(async ({ input }) => {
		console.log("LISTING PLANETS");

		// your list code here
		return [{ id: 1, name: "name" }];
	});

export const findPlanet = base.use(authMiddleware)
	.input(
		z
			.object({
				id: z.number().int().min(1),
				name: z.string(),
				description: z.string().optional(),
			})
			.pick({ id: true })
	)
	.handler(async ({ input }) => {
		// your find code here
		return { id: 1, name: "name" };
	});

export const router = {
	planet: {
		list: listPlanet,
		find: findPlanet,
	},
};

export type AppRouter = typeof router;
