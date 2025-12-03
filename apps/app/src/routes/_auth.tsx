import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ location }) => {
		const session = await authClient.getSession();
		console.log(session);

		if (!session || !session.data || session.error) {
			throw redirect({
				to: "/auth/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
});
