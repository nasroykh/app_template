import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuth } from "@/lib/auth";

export const Route = createFileRoute("/_notauth")({
	beforeLoad: async ({ location }) => {
		if (isAuth()) {
			throw redirect({
				to: "/",
				search: {
					redirect: location.href,
				},
			});
		}
	},
});
