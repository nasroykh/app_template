import { createAuthClient } from "better-auth/react";
import {
	emailOTPClient,
	organizationClient,
	adminClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: `${import.meta.env.VITE_API_URL}/auth`,
	plugins: [adminClient(), organizationClient(), emailOTPClient()],
});

export type User = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session;

export const { useSession, signIn, signUp, signOut, getSession } = authClient;
