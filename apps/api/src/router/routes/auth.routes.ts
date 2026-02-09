import { z } from "zod";

import { publicProcedure, authProcedure } from "../middleware";
import { env } from "../../config/env";
import {
	signInEmail,
	signUpEmail,
	signOut,
	getSession,
	sendVerificationOtp,
	verifyEmailOtp,
	forgetPasswordOtp,
	checkVerificationOtp,
	resetPasswordWithOtp,
	updateProfile,
} from "../../services/auth.service";

export const PREFIX = env.API_V1_PREFIX as `/${string}`;

// =============================================================================
// Schemas
// =============================================================================

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

const signUpSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1),
});

const emailSchema = z.object({
	email: z.string().email(),
});

const verifyOtpSchema = z.object({
	email: z.string().email(),
	otp: z.string().min(4),
});

const resetPasswordSchema = z.object({
	email: z.string().email(),
	otp: z.string().min(4),
	newPassword: z.string().min(8),
});

const updateProfileSchema = z.object({
	name: z.string().min(1).optional(),
	image: z.string().optional(),
});

// =============================================================================
// Auth Routes
// =============================================================================

export const authRoutes = {
	// -------------------------------------------------------------------------
	// Sign In
	// -------------------------------------------------------------------------
	signIn: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/sign-in`,
			description: "Sign in with email and password",
		})
		.input(signInSchema)
		.handler(async ({ input, context }) => {
			return signInEmail(input, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Sign Up
	// -------------------------------------------------------------------------
	signUp: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/sign-up`,
			description: "Sign up with email and password",
		})
		.input(signUpSchema)
		.handler(async ({ input, context }) => {
			return signUpEmail(input, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Sign Out
	// -------------------------------------------------------------------------
	signOut: authProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/sign-out`,
			description: "Sign out the current user",
		})
		.handler(async ({ context }) => {
			return signOut(context.headers);
		}),

	// -------------------------------------------------------------------------
	// Get Session
	// -------------------------------------------------------------------------
	getSession: publicProcedure
		.route({
			method: "GET",
			path: `${PREFIX}/auth/session`,
			description: "Get current session data",
		})
		.handler(async ({ context }) => {
			return getSession(context.headers);
		}),

	// -------------------------------------------------------------------------
	// Send Verification OTP
	// -------------------------------------------------------------------------
	sendVerificationOtp: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/send-verification-otp`,
			description: "Send verification OTP to email",
		})
		.input(emailSchema)
		.handler(async ({ input, context }) => {
			return sendVerificationOtp(input.email, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Verify Email with OTP
	// -------------------------------------------------------------------------
	verifyEmail: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/verify-email`,
			description: "Verify email with OTP",
		})
		.input(verifyOtpSchema)
		.handler(async ({ input, context }) => {
			return verifyEmailOtp(input, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Forget Password (Send OTP)
	// -------------------------------------------------------------------------
	forgetPassword: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/forget-password`,
			description: "Send password reset OTP",
		})
		.input(emailSchema)
		.handler(async ({ input, context }) => {
			return forgetPasswordOtp(input.email, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Check Verification OTP
	// -------------------------------------------------------------------------
	checkVerificationOtp: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/check-verification-otp`,
			description: "Check if verification OTP is valid",
		})
		.input(verifyOtpSchema)
		.handler(async ({ input, context }) => {
			return checkVerificationOtp(input, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Reset Password
	// -------------------------------------------------------------------------
	resetPassword: publicProcedure
		.route({
			method: "POST",
			path: `${PREFIX}/auth/reset-password`,
			description: "Reset password with OTP",
		})
		.input(resetPasswordSchema)
		.handler(async ({ input, context }) => {
			return resetPasswordWithOtp(input, context.headers);
		}),

	// -------------------------------------------------------------------------
	// Update Profile
	// -------------------------------------------------------------------------
	updateProfile: authProcedure
		.route({
			method: "PATCH",
			path: `${PREFIX}/auth/profile`,
			description: "Update current user profile",
		})
		.input(updateProfileSchema)
		.handler(async ({ input, context }) => {
			return updateProfile(input, context.headers);
		}),
};
