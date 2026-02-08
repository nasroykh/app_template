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
	DropdownMenuPositioner,
} from "@/components/ui/dropdown-menu";
import { themeAtom, type Theme } from "@/atoms/global";
import { useAtom, useAtomValue } from "jotai";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { userAtom } from "@/atoms/auth";

const navItems = [{ title: "Dashboard", icon: IconHome, href: "/" }];

export function AppSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const $user = useAtomValue(userAtom);
	const [theme, setTheme] = useAtom(themeAtom);

	const themeOptions: { value: Theme; label: string; icon: typeof IconSun }[] =
		[
			{ value: "light", label: "Light", icon: IconSun },
			{ value: "dark", label: "Dark", icon: IconMoon },
			{ value: "system", label: "System", icon: IconDeviceDesktop },
		];

	const handleLogout = async () => {
		try {
			const res = await authClient.signOut();
			if (!res.data || res.error) {
				toast.error((res.error && res.error.message) || "Failed to logout");
				return;
			}
			navigate({ to: "/auth/login" });
		} catch (error) {
			console.error("Logout failed:", error);
			toast.error("Logout failed");
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
										tooltip={item.title}
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
							<DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
								<Avatar className="size-8">
									<AvatarImage
										src={$user?.image || undefined}
										alt="User avatar"
									/>
									<AvatarFallback className="bg-primary/10 text-primary text-xs">
										{$user?.name
											?.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()
											.slice(0, 2) || "U"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-0.5 leading-none text-left">
									<span className="font-medium">{$user?.name || "User"}</span>
									<span className="text-xs text-muted-foreground">
										{$user?.email || ""}
									</span>
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuPositioner side="bottom" align="center">
								<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
									<DropdownMenuItem render={<Link to="/settings" />}>
										<IconSettings className="mr-2 size-4" />
										Settings
									</DropdownMenuItem>
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
							</DropdownMenuPositioner>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
