import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/_notauth")({
	beforeLoad: async () => {
		const session = await authClient.getSession();

		if (session.data && session.data.user) {
			throw redirect({
				to: "/",
			});
		}
	},
});
