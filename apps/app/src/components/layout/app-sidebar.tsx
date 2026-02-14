import { Link, useLocation } from "@tanstack/react-router";
import {
	IconHome,
	IconSettings,
	IconLogout,
	IconSparkles,
	IconSun,
	IconMoon,
	IconDeviceDesktop,
	IconCheck,
	IconBuilding,
} from "@tabler/icons-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { themeAtom, type Theme } from "@/atoms/global";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { authClient, type User } from "@/lib/auth";

const navItems = [{ title: "Dashboard", icon: IconHome, href: "/" }];

export function AppSidebar({ user }: { user?: User | null }) {
	const location = useLocation();
	const navigate = useNavigate();
	const [theme, setTheme] = useAtom(themeAtom);
	const { data: activeOrg } = authClient.useActiveOrganization();
	const { data: organizations } = authClient.useListOrganizations();

	const themeOptions: { value: Theme; label: string; icon: typeof IconSun }[] =
		[
			{ value: "light", label: "Light", icon: IconSun },
			{ value: "dark", label: "Dark", icon: IconMoon },
			{ value: "system", label: "System", icon: IconDeviceDesktop },
		];

	const handleSwitchOrganization = async (organizationId: string) => {
		if (organizationId === activeOrg?.id) return;

		try {
			await authClient.organization.setActive({
				organizationId,
			});

			// Refetch session to get updated active organization
			await authClient.getSession();

			toast.success("Organization switched successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to switch organization");
		}
	};

	const handleLogout = async () => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate({ to: "/auth/login" });
					},
				},
			});
		} catch (error: any) {
			console.error("Logout failed:", error);
			toast.error(error.message || "Logout failed");
		}
	};

	return (
		<Sidebar collapsible="icon">
			{/* Logo Header */}
			<SidebarHeader className="">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" render={<Link to="/" />}>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<IconSparkles className="size-4" />
							</div>
							<div className="flex flex-col gap-0.5 leading-none">
								<span className="font-semibold">Acme Inc</span>
								<span className="text-xs text-muted-foreground">Dashboard</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* Navigation */}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										render={
											item.href !== "#" ? <Link to={item.href} /> : undefined
										}
										isActive={
											item.href === "/"
												? location.pathname === item.href
												: location.pathname.startsWith(item.href)
										}
									>
										{item.href !== "#" ? (
											<>
												<item.icon />
												<span>{item.title}</span>
											</>
										) : (
											<>
												<item.icon />
												<span>{item.title}</span>
											</>
										)}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* User Profile Footer */}
			<SidebarFooter className="border-t border-sidebar-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<SidebarMenuButton size="lg">
										<Avatar className="size-8">
											<AvatarImage
												src={user?.image || undefined}
												alt="User avatar"
											/>
											<AvatarFallback className="bg-primary/10 text-primary text-xs">
												{user?.name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase()
													.slice(0, 2) || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col gap-0.5 leading-none text-left">
											<span className="font-medium">
												{user?.name || "User"}
											</span>
											<span className="text-xs text-muted-foreground">
												{user?.email || ""}
											</span>
										</div>
									</SidebarMenuButton>
								}
							/>
							<DropdownMenuContent
								className="w-56"
								side="bottom"
								align="center"
							>
								<DropdownMenuItem render={<Link to="/settings" />}>
									<IconSettings className="mr-2 size-4" />
									Settings
								</DropdownMenuItem>
								{organizations && organizations.length > 1 && (
									<DropdownMenuSub>
										<DropdownMenuSubTrigger>
											<IconBuilding className="mr-2 size-4" />
											Organization
										</DropdownMenuSubTrigger>
										<DropdownMenuPortal>
											<DropdownMenuSubContent>
												{organizations.map((org) => (
													<DropdownMenuItem
														key={org.id}
														onClick={() => handleSwitchOrganization(org.id)}
													>
														<IconBuilding className="mr-2 size-4" />
														<span className="flex-1 truncate">{org.name}</span>
														{activeOrg?.id === org.id && (
															<IconCheck className="ml-2 size-4" />
														)}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuPortal>
									</DropdownMenuSub>
								)}
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<IconSun className="mr-2 size-4" />
										Theme
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											{themeOptions.map((option) => (
												<DropdownMenuItem
													key={option.value}
													onClick={() => setTheme(option.value)}
												>
													<option.icon className="mr-2 size-4" />
													{option.label}
													{theme === option.value && (
														<IconCheck className="ml-auto size-4" />
													)}
												</DropdownMenuItem>
											))}
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									<IconLogout className="mr-2 size-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
