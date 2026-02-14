import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_notauth")({
	beforeLoad: async ({ context }) => {
		if (!context.session) return;

		throw redirect({
			to: "/",
		});
	},
});
