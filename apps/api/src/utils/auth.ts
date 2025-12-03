// packages/auth/src/server.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";

import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { sendOTPEmail } from "../services/auth.service";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	plugins: [
		organization(),
		emailOTP({
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "sign-in") {
					sendOTPEmail(email, otp);
				} else if (type === "email-verification") {
					sendOTPEmail(email, otp);
				} else {
					sendOTPEmail(email, otp);
				}
			},
		}),
	],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	trustedOrigins: [process.env.APP_URL!],
});
