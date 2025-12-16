import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouter } from "api/orpc";

const link = new RPCLink({
	url: import.meta.env.VITE_IS_DEV
		? `${import.meta.env.VITE_API_URL_DEV}/rpc`
		: `${import.meta.env.VITE_API_URL}/rpc`,
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link);
