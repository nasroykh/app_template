import { z } from "zod";
import { authProcedure, publicProcedure, router } from "../trpc";
import { authService } from "../../services/auth.service";

const authRouter = router({
	/**
	 * Register a new user
	 */
	register: publicProcedure
		.input(
			z.object({
				email: z.email(),
				username: z.string().min(3),
				password: z.string().min(8),
				organization_slug: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			return await authService.register(input);
		}),

	/**
	 * Login user
	 */
	login: publicProcedure
		.input(
			z.object({
				email: z.email(),
				password: z.string(),
				organization_slug: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			return await authService.login(input);
		}),

	/**
	 * Refresh access token
	 */
	refresh: publicProcedure
		.input(z.object({ refreshToken: z.string() }))
		.mutation(async ({ input }) => {
			return await authService.refresh(input.refreshToken);
		}),

	/**
	 * Logout user (invalidate all refresh tokens)
	 */
	logout: authProcedure.mutation(async ({ ctx }) => {
		return await authService.logout(ctx.user.userId);
	}),

	/**
	 * Verify email with code
	 */
	verifyEmail: authProcedure
		.input(z.object({ code: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await authService.verifyEmail({
				userId: ctx.user.userId,
				code: input.code,
			});
		}),

	/**
	 * Request password reset
	 */
	requestPasswordReset: publicProcedure
		.input(
			z.object({
				email: z.email(),
				organization_slug: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			return await authService.requestPasswordReset(
				input.email,
				input.organization_slug
			);
		}),

	/**
	 * Reset password with code
	 */
	resetPassword: publicProcedure
		.input(
			z.object({
				userId: z.uuid(),
				code: z.string(),
				newPassword: z.string().min(8),
			})
		)
		.mutation(async ({ input }) => {
			return await authService.resetPassword(input);
		}),

	/**
	 * Get current user info
	 */
	me: authProcedure.query(async ({ ctx }) => {
		return await authService.me(ctx.user.userId);
	}),
});

export { authRouter };
