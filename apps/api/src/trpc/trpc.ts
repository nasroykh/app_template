import { initTRPC, TRPCError } from "@trpc/server";
import { jwtUtils } from "../utils/jwt";
import type { Context } from "./context";
import SuperJSON from "superjson";

const t = initTRPC.context<Context>().create({
	transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const authProcedure = t.procedure.use(async ({ ctx, next }) => {
	let token: string | null | undefined = ctx.req?.headers?.authorization;

	if (!token) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "No authorization header provided",
		});
	}

	token = jwtUtils.extractTokenFromHeader(token);

	if (!token) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid authorization header format",
		});
	}

	try {
		const payload = jwtUtils.verifyAccessToken(token);

		return next({
			ctx: {
				...ctx,
				user: payload,
			},
		});
	} catch (error) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message:
				error instanceof Error ? error.message : "Token verification failed",
		});
	}
});
