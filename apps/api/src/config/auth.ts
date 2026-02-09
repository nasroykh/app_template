import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, organization, bearer } from "better-auth/plugins";

import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { sendOTPEmail, sendInvitationEmail } from "../services/email.service";
import { env } from "./env";

export const auth = betterAuth({
	basePath: `${env.API_V1_PREFIX}/auth`,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	plugins: [
		admin(),
		bearer(),
		organization({
			async sendInvitationEmail(data) {
				const inviteLink = `${env.APP_URL}/invite/${data.id}`;
				sendInvitationEmail(
					data.email,
					data.inviter.user.name,
					data.organization.name,
					inviteLink,
				);
			},
		}),
		emailOTP({
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp }) {
				sendOTPEmail(email, otp);
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
	trustedOrigins: [env.APP_URL],
});
