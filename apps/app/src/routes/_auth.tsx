import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context, location }) => {
		if (context.session) return;

		throw redirect({
			to: "/auth/login",
			search: {
				redirect: location.href,
			},
		});
	},
});
