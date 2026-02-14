import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Layout({
	children,
	hideHeader = false,
}: {
	children: React.ReactNode;
	hideHeader?: boolean;
}) {
	const { data: sessionData, isPending } = useSession();

	if (isPending) {
		return null;
	}

	return (
		<SidebarProvider>
			<AppSidebar user={sessionData?.user} />
			<SidebarInset>
				<header
					className={cn(
						"flex h-14 shrink-0 items-center gap-4 px-4 bg-sidebar",
						{
							hidden: hideHeader,
						},
					)}
				>
					<SidebarTrigger className="-ml-1" />
					<span className="font-medium text-sm">Dashboard</span>
				</header>
				<main className="flex-1 overflow-auto p-4">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
