import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuth } from "@/lib/auth";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ location }) => {
		if (!isAuth()) {
			throw redirect({
				to: "/auth/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
});
