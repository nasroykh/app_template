import { Hono } from "hono";

import { auth } from "../config/auth";
import { env } from "../config/env";
import { db, user } from "@repo/db";
import { eq } from "@repo/db/drizzle-orm";

export const registerAuth = (app: Hono) => {
	initSuperAdmin();

	// Mount the Better Auth handler.
	// The config defines basePath: `${env.API_V1_PREFIX}/auth`,
	// and the app (index.ts) is base-pathed to env.API_V1_PREFIX.
	// So mounting at /auth/* here is correct.
	app.on(["POST", "GET"], `/auth/*`, (c) => {
		return auth.handler(c.req.raw);
	});
};

const initSuperAdmin = async () => {
	try {
		const [superAdminExists] = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.email, env.SUPER_ADMIN_EMAIL))
			.limit(1);

		if (superAdminExists) {
			// Ensure super admin has admin role
			await db
				.update(user)
				.set({ role: "admin", emailVerified: true })
				.where(eq(user.id, superAdminExists.id));
			return;
		}

		await auth.api.createUser({
			body: {
				email: env.SUPER_ADMIN_EMAIL,
				password: env.SUPER_ADMIN_PASSWORD,
				name: "Super Admin",
				role: "admin",
			},
		});

		await db
			.update(user)
			.set({ emailVerified: true })
			.where(eq(user.email, env.SUPER_ADMIN_EMAIL));

		console.log("Super admin initialized successfully");
	} catch (error) {
		console.error("Failed to initialize super admin:", error);
	}
};
