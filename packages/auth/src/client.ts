// packages/auth/src/client.ts
import { createAuthClient } from "better-auth/react";

if (!process.env.API_URL) {
	throw new Error("API_URL is not defined in environment variables");
}

export const authClient = createAuthClient({
	baseURL: process.env.API_URL,
});

export const {
	signIn,
	signUp,
	signOut,
	useSession,
	// ... other exports you need
} = authClient;
