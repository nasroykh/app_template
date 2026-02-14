import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { authClient } from "@/lib/auth";
import type { SessionData } from "@/main";

type RouterContext = {
	session: SessionData | undefined;
};

const RootLayout = () => {
	return (
		<ThemeProvider>
			<Outlet />
			<Toaster />
		</ThemeProvider>
	);
};

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async () => {
		const res = await authClient.getSession();
		return {
			session: res.data && !res.error ? res.data : null,
		};
	},
	component: RootLayout,
});
