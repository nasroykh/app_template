import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const logoutHandler = async () => {
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
		<div className="min-h-dvh flex items-center justify-center">
			<Button onClick={logoutHandler}>Logout</Button>
		</div>
	);
}
