import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Moon, Sun } from "lucide-react";
import React from "react";

const RootLayout = () => {
	const [isDark, setIsDark] = React.useState(
		localStorage.getItem("theme") === "dark"
	);

	React.useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDark]);

	const toggleDarkMode = () => {
		setIsDark(!isDark);
		localStorage.setItem("theme", !isDark ? "dark" : "light");
		if (!isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	return (
		<>
			{/* Dark Mode Toggle */}
			<Button
				onClick={toggleDarkMode}
				size="icon-lg"
				aria-label="Toggle dark mode"
				className="fixed top-10 right-10"
			>
				{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
			</Button>
			<Outlet />
			<TanStackRouterDevtools />
			<Toaster />
		</>
	);
};

export const Route = createRootRoute({ component: RootLayout });
