// packages/auth/src/server.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "db"; // Your Drizzle db instance type

export function createAuth() {
	if (!process.env.APP_URL) {
		throw new Error("APP_URL is not defined in environment variables");
	}

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false, // Set true in production with email service
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60, // 5 minutes
			},
		},
		trustedOrigins: [process.env.APP_URL],
		// Add OAuth providers as needed
		// socialProviders: {
		//   google: {
		//     clientId: process.env.GOOGLE_CLIENT_ID!,
		//     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		//   },
		// },
	});
}

export type Auth = ReturnType<typeof createAuth>;
