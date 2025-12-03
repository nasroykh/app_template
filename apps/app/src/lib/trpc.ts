import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { type AppRouter } from "api/trpc";
import { QueryClient } from "@tanstack/react-query";
import {
	createTRPCClient,
	createWSClient,
	httpBatchLink,
	splitLink,
	wsLink,
} from "@trpc/client";
import SuperJSON from "superjson";
import cookies from "js-cookie";

export const queryClient = new QueryClient();

// Create WebSocket client with proper configuration
const wsClient = createWSClient({
	url:
		`${
			import.meta.env.VITE_IS_DEV
				? import.meta.env.VITE_API_WS_URL_DEV || "ws://localhost:3001"
				: import.meta.env.VITE_API_WS_URL || "ws://localhost:3001"
		}`.replace(/\/+$/, "") + "/trpc",
	connectionParams: () => {
		const token = cookies.get("auth_access_token");
		return token ? { Authorization: `Bearer ${token}` } : {};
	},
	onOpen() {
		console.log("WebSocket connection opened");
	},
	onClose() {
		console.log("WebSocket connection closed");
	},
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		splitLink({
			condition(op) {
				return op.type === "subscription";
			},
			true: wsLink({
				client: wsClient,
				transformer: SuperJSON,
			}),
			false: httpBatchLink({
				url:
					`${
						import.meta.env.VITE_IS_DEV
							? import.meta.env.VITE_API_URL_DEV || "http://localhost:3001"
							: import.meta.env.VITE_API_URL || "http://localhost:3001"
					}`.replace(/\/+$/, "") + "/trpc",
				maxURLLength: 2000,
				headers: () => {
					const token = cookies.get("auth_access_token");

					return token ? { Authorization: `Bearer ${token}` } : {};
				},
				transformer: SuperJSON,
			}),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
