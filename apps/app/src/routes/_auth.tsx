import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ location }) => {
		const session = await authClient.getSession();

		if (!session || !session.data || session.error) {
			throw redirect({
				to: "/auth/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-4 px-4">
					<SidebarTrigger className="-ml-1" />
					<span className="font-medium text-sm">Dashboard</span>
				</header>
				<main className="flex-1 overflow-auto p-6">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
