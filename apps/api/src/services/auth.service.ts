import { db, organizationsTable, usersTable, verificationCodesTable } from "db";
import dayjs from "dayjs";
import { eq, and, gt } from "db/drizzle-orm";
import argon2 from "argon2";
import { jwtUtils } from "../utils/jwt";
import { TRPCError } from "@trpc/server";
import { isEmailValid } from "../utils/validators";
import { generateVerificationCode } from "../utils/generators";
import { transporter } from "../config/nodemailer";

export const authService = {
	/**
	 * Register a new user
	 */
	async register(data: {
		email: string;
		username: string;
		password: string;
		organization_slug?: string;
	}) {
		data.email = data.email.toLowerCase().trim();
		data.username = data.username.toLowerCase().trim();

		if (!isEmailValid(data.email))
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid email",
			});

		let organizationId: string | undefined;

		if (data.organization_slug) {
			const [existingOrganization] = await db
				.select({ id: organizationsTable.id })
				.from(organizationsTable)
				.where(
					eq(
						organizationsTable.slug,
						data.organization_slug.toLowerCase().trim()
					)
				)
				.limit(1);

			if (!existingOrganization)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization not found",
				});

			organizationId = existingOrganization.id;
		} else {
			const organizationSlug = `${data.username}-${dayjs().unix() % 100000000}`;
			const organizationName = `${data.username}'s Organization`;

			const [createdOrganization] = await db
				.insert(organizationsTable)
				.values({
					slug: organizationSlug,
					name: organizationName,
				})
				.returning({ id: organizationsTable.id });

			if (!createdOrganization)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create organization",
				});

			organizationId = createdOrganization.id;
		}

		// Check if user already exists
		const [existingUser] = await db
			.select({
				id: usersTable.id,
			})
			.from(usersTable)
			.where(
				and(
					eq(usersTable.email, data.email),
					eq(usersTable.organization_id, organizationId)
				)
			)
			.limit(1);

		if (existingUser)
			throw new TRPCError({
				code: "CONFLICT",
				message: "User with this email already exists",
			});

		// Hash password
		const password_hash = await argon2.hash(data.password);

		// Create user
		const [createdUser] = await db
			.insert(usersTable)
			.values({
				email: data.email,
				username: data.username,
				password_hash,
				organization_id: organizationId,
				user_details: {},
				role: data.organization_slug ? "user" : "admin",
			})
			.returning();

		// Generate verification code
		const verificationCode = generateVerificationCode();
		const expiresAt = dayjs().add(3, "hour").toDate();

		await db.insert(verificationCodesTable).values({
			code: verificationCode,
			purpose: "email_verification",
			expires_at: expiresAt,
			user_id: createdUser.id,
		});

		await transporter.sendMail({
			to: createdUser.email,
			subject: "Verify your email",
			html: `<p>Your verification code is <strong>${verificationCode}</strong>.</p><p>It will expire in 3 hours.</p>`,
		});

		return {
			user: {
				id: createdUser.id,
				email: createdUser.email,
				username: createdUser.username,
				role: createdUser.role,
				email_verified_at: createdUser.email_verified_at,
			},
		};
	},

	/**
	 * Login user
	 */
	async login(data: {
		email: string;
		password: string;
		organization_slug?: string;
	}) {
		let organizationId: string | undefined;

		if (data.organization_slug) {
			const [existingOrganization] = await db
				.select({ id: organizationsTable.id })
				.from(organizationsTable)
				.where(
					eq(
						organizationsTable.slug,
						data.organization_slug.toLowerCase().trim()
					)
				)
				.limit(1);

			if (!existingOrganization)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization not found",
				});

			organizationId = existingOrganization.id;
		}

		// Find user
		const [foundUser] = await db
			.select({
				id: usersTable.id,
				email: usersTable.email,
				username: usersTable.username,
				password_hash: usersTable.password_hash,
				role: usersTable.role,
				email_verified_at: usersTable.email_verified_at,
				deleted_at: usersTable.deleted_at,
				organization_id: usersTable.organization_id,
			})
			.from(usersTable)
			.where(
				and(
					eq(usersTable.email, data.email),
					organizationId
						? eq(usersTable.organization_id, organizationId)
						: undefined
				)
			)
			.limit(1);

		if (!foundUser)
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid email or password",
			});

		// Check if user is soft deleted
		if (foundUser.deleted_at)
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Account has been deactivated",
			});

		// Verify password
		const isValidPassword = await argon2.verify(
			foundUser.password_hash,
			data.password
		);

		if (!isValidPassword)
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid email or password",
			});

		// Update last seen
		await db
			.update(usersTable)
			.set({ last_seen_at: new Date() })
			.where(eq(usersTable.id, foundUser.id));

		// Generate tokens
		const tokens = jwtUtils.generateTokenPair({
			userId: foundUser.id,
			email: foundUser.email,
			organizationId: foundUser.organization_id,
			role: foundUser.role,
		});

		return {
			user: {
				id: foundUser.id,
				email: foundUser.email,
				username: foundUser.username,
				role: foundUser.role,
				email_verified_at: foundUser.email_verified_at,
			},
			...tokens,
		};
	},

	/**
	 * Refresh access token using refresh token
	 */
	async refresh(refreshToken: string) {
		try {
			// Verify refresh token
			const payload = jwtUtils.verifyRefreshToken(refreshToken);

			// Get user
			const [foundUser] = await db
				.select({
					id: usersTable.id,
					deleted_at: usersTable.deleted_at,
					email: usersTable.email,
					organization_id: usersTable.organization_id,
					role: usersTable.role,
				})
				.from(usersTable)
				.where(eq(usersTable.id, payload.userId))
				.limit(1);

			if (!foundUser)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not found",
				});

			// Check if user is soft deleted
			if (foundUser.deleted_at)
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Account has been deactivated",
				});

			// Generate new tokens
			const tokens = jwtUtils.generateTokenPair({
				userId: foundUser.id,
				email: foundUser.email,
				organizationId: foundUser.organization_id,
				role: foundUser.role,
			});

			return tokens;
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid or expired refresh token",
			});
		}
	},

	/**
	 * Logout user (invalidate all refresh tokens)
	 */
	async logout(userId: string) {
		// TODO: Increment token version to invalidate all refresh tokens
		return { success: true };
	},

	/**
	 * Verify email with code
	 */
	async verifyEmail(data: { userId: string; code: string }) {
		data.code = data.code.toUpperCase().trim();

		// Find verification code
		const [verificationCodeFound] = await db
			.select({ id: verificationCodesTable.id })
			.from(verificationCodesTable)
			.where(
				and(
					eq(verificationCodesTable.user_id, data.userId),
					eq(verificationCodesTable.code, data.code),
					eq(verificationCodesTable.purpose, "email_verification"),
					gt(verificationCodesTable.expires_at, new Date())
				)
			)
			.limit(1);

		if (!verificationCodeFound)
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid or expired verification code",
			});

		// Update user
		await db
			.update(usersTable)
			.set({ email_verified_at: new Date() })
			.where(eq(usersTable.id, data.userId));

		// Delete verification code
		await db
			.delete(verificationCodesTable)
			.where(eq(verificationCodesTable.id, verificationCodeFound.id));

		return { success: true };
	},

	/**
	 * Request password reset
	 */
	async requestPasswordReset(email: string, organization_slug?: string) {
		let organizationId: string | undefined;

		if (organization_slug) {
			const [existingOrganization] = await db
				.select({ id: organizationsTable.id })
				.from(organizationsTable)
				.where(
					eq(organizationsTable.slug, organization_slug.toLowerCase().trim())
				)
				.limit(1);

			if (!existingOrganization)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Organization not found",
				});

			organizationId = existingOrganization.id;
		}

		// Find user
		const [foundUser] = await db
			.select({
				id: usersTable.id,
				email: usersTable.email,
			})
			.from(usersTable)
			.where(
				and(
					eq(usersTable.email, email),
					organizationId
						? eq(usersTable.organization_id, organizationId)
						: undefined
				)
			)
			.limit(1);

		if (!foundUser) {
			// Don't reveal if user exists
			return { success: true };
		}

		// Generate reset code
		const resetCode = generateVerificationCode();
		const expiresAt = dayjs().add(1, "hour").toDate();

		const [createdVerificationCode] = await db
			.insert(verificationCodesTable)
			.values({
				code: resetCode,
				purpose: "password_reset",
				expires_at: expiresAt,
				user_id: foundUser.id,
			})
			.returning({ code: verificationCodesTable.code });

		if (!createdVerificationCode)
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create verification code",
			});

		await transporter.sendMail({
			to: foundUser.email,
			subject: "Reset your password",
			html: `<p>Your reset code is <strong>${createdVerificationCode.code}</strong>.</p><p>It will expire in 1 hour.</p>`,
		});

		return {
			success: true,
		};
	},

	/**
	 * Reset password with code
	 */
	async resetPassword(data: {
		userId: string;
		code: string;
		newPassword: string;
	}) {
		data.code = data.code.toUpperCase().trim();

		// Find user
		const [foundUser] = await db
			.select({
				id: usersTable.id,
				verification_code_id: verificationCodesTable.id,
			})
			.from(usersTable)
			.innerJoin(
				verificationCodesTable,
				eq(verificationCodesTable.user_id, usersTable.id)
			)
			.where(
				and(
					eq(usersTable.id, data.userId),
					eq(verificationCodesTable.code, data.code),
					eq(verificationCodesTable.purpose, "password_reset"),
					gt(verificationCodesTable.expires_at, new Date())
				)
			)
			.limit(1);

		if (!foundUser)
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid reset code",
			});

		// Hash new password
		const password_hash = await argon2.hash(data.newPassword);

		// Update user password
		await db
			.update(usersTable)
			.set({
				password_hash,
			})
			.where(eq(usersTable.id, foundUser.id));

		// Delete verification code
		await db
			.delete(verificationCodesTable)
			.where(eq(verificationCodesTable.id, foundUser.verification_code_id));

		return { success: true };
	},

	/**
	 * Get current user info
	 */
	async me(userId: string) {
		const [foundUser] = await db
			.select({
				id: usersTable.id,
				email: usersTable.email,
				username: usersTable.username,
				role: usersTable.role,
				status: usersTable.status,
				email_verified_at: usersTable.email_verified_at,
				last_seen_at: usersTable.last_seen_at,
				user_details: usersTable.user_details,
				organization_id: usersTable.organization_id,
				created_at: usersTable.created_at,
			})
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1);

		if (!foundUser)
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});

		return {
			id: foundUser.id,
			email: foundUser.email,
			username: foundUser.username,
			role: foundUser.role,
			status: foundUser.status,
			email_verified_at: foundUser.email_verified_at,
			last_seen_at: foundUser.last_seen_at,
			user_details: foundUser.user_details,
			organization_id: foundUser.organization_id,
			created_at: foundUser.created_at,
		};
	},
};
