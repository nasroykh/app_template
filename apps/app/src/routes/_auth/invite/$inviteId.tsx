import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	IconBuilding,
	IconCircleCheck,
	IconCircleX,
	IconLoader2,
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_auth/invite/$inviteId")({
	component: InvitePage,
});

// Schemas
const signupSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

const loginSchema = z.object({
	password: z.string().min(1, "Password is required"),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

type InvitationData = {
	id: string;
	email: string;
	organizationName: string;
	inviterEmail: string;
	role: string;
	status: string;
};

function InvitePage() {
	const { inviteId } = Route.useParams();
	const navigate = useNavigate();

	const [invitation, setInvitation] = useState<InvitationData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userExists, setUserExists] = useState(false);
	const [status, setStatus] = useState<"pending" | "accepted" | "rejected">(
		"pending",
	);

	const signupForm = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: { name: "", password: "", confirmPassword: "" },
	});

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { password: "" },
	});

	// Mutations
	const signUpMutation = useMutation(orpc.auth.signUp.mutationOptions({}));
	const signInMutation = useMutation(orpc.auth.signIn.mutationOptions({}));
	const acceptMutation = useMutation(
		orpc.organization.acceptInvitation.mutationOptions({}),
	);
	const rejectMutation = useMutation(
		orpc.organization.rejectInvitation.mutationOptions({}),
	);

	useEffect(() => {
		loadInvitation();
	}, [inviteId]);

	const loadInvitation = async () => {
		setIsLoading(true);
		try {
			// Check if user is already logged in (keep authClient for session)
			const session = await authClient.getSession();
			if (session.data?.user) {
				setIsLoggedIn(true);
			}

			// Get invitation details via oRPC
			const invData = await orpc.organization.getInvitation.call({
				invitationId: inviteId,
			});

			if (!invData) {
				toast.error("Invalid or expired invitation");
				setInvitation(null);
				return;
			}

			setInvitation(invData as InvitationData);
			setUserExists(false);
		} catch (error) {
			console.error("Failed to load invitation:", error);
			toast.error("Failed to load invitation");
		} finally {
			setIsLoading(false);
		}
	};

	const acceptInvitation = async () => {
		await acceptMutation.mutateAsync({ invitationId: inviteId });

		// Set this organization as active
		const orgsData = await orpc.organization.list.call({});
		const targetOrg = orgsData?.find(
			(org: any) => org.name === invitation?.organizationName,
		);
		if (targetOrg) {
			await orpc.organization.setActive.call({
				organizationId: targetOrg.id,
			});
		}

		setStatus("accepted");
		toast.success("You've joined the organization!");

		setTimeout(() => {
			navigate({ to: "/" });
		}, 2000);
	};

	const onSignupSubmit = async (data: SignupFormValues) => {
		if (!invitation) return;

		try {
			// 1. Create account with the invited email
			await signUpMutation.mutateAsync({
				email: invitation.email,
				name: data.name,
				password: data.password,
			});

			// 2. Accept the invitation
			await acceptInvitation();
		} catch (error) {
			console.error("Signup failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to join organization",
			);
		}
	};

	const onLoginSubmit = async (data: LoginFormValues) => {
		if (!invitation) return;

		try {
			// 1. Login with the invited email
			await signInMutation.mutateAsync({
				email: invitation.email,
				password: data.password,
			});

			// 2. Accept the invitation
			await acceptInvitation();
		} catch (error) {
			console.error("Login failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to join organization",
			);
		}
	};

	const handleAcceptLoggedIn = async () => {
		try {
			await acceptInvitation();
		} catch (error) {
			console.error("Accept failed:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to accept invitation",
			);
		}
	};

	const handleReject = async () => {
		try {
			await rejectMutation.mutateAsync({ invitationId: inviteId });
			setStatus("rejected");
			toast.success("Invitation declined");
		} catch (error) {
			console.error("Failed to reject invitation:", error);
			toast.error("Failed to reject invitation");
		}
	};

	const isSubmitting =
		signUpMutation.isPending ||
		signInMutation.isPending ||
		acceptMutation.isPending ||
		rejectMutation.isPending;

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<Skeleton className="size-12 rounded-full mx-auto mb-4" />
						<Skeleton className="h-6 w-48 mx-auto mb-2" />
						<Skeleton className="h-4 w-64 mx-auto" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	// Invalid invitation
	if (!invitation) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className="rounded-full bg-destructive/10 p-3">
								<IconCircleX className="size-8 text-destructive" />
							</div>
						</div>
						<CardTitle>Invalid Invitation</CardTitle>
						<CardDescription>
							This invitation link is invalid or has expired.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button onClick={() => navigate({ to: "/auth/login" })}>
							Go to Login
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Accepted state
	if (status === "accepted") {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className="rounded-full bg-primary/10 p-3">
								<IconCircleCheck className="size-8 text-primary" />
							</div>
						</div>
						<CardTitle>Welcome!</CardTitle>
						<CardDescription>
							You've successfully joined {invitation.organizationName}.
							Redirecting to dashboard...
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	// Rejected state
	if (status === "rejected") {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className="rounded-full bg-muted p-3">
								<IconCircleX className="size-8 text-muted-foreground" />
							</div>
						</div>
						<CardTitle>Invitation Declined</CardTitle>
						<CardDescription>
							You've declined the invitation to join{" "}
							{invitation.organizationName}.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button
							variant="outline"
							onClick={() => navigate({ to: "/auth/login" })}
						>
							Go to Login
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Already logged in - just show accept/reject
	if (isLoggedIn) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className="rounded-full bg-primary/10 p-3">
								<IconBuilding className="size-8 text-primary" />
							</div>
						</div>
						<CardTitle>You're Invited!</CardTitle>
						<CardDescription className="mt-2 space-y-1">
							<p>
								<strong>{invitation.inviterEmail}</strong> has invited you to
								join
							</p>
							<p className="text-lg font-semibold text-foreground">
								{invitation.organizationName}
							</p>
							<p className="text-sm">
								as a <strong>{invitation.role}</strong>
							</p>
						</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-3 justify-center">
						<Button
							variant="outline"
							onClick={handleReject}
							disabled={isSubmitting}
						>
							Decline
						</Button>
						<Button onClick={handleAcceptLoggedIn} disabled={isSubmitting}>
							{acceptMutation.isPending ? (
								<>
									<IconLoader2 className="mr-2 size-4 animate-spin" />
									Accepting...
								</>
							) : (
								"Accept Invitation"
							)}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Not logged in - show signup/login form
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="rounded-full bg-primary/10 p-3">
							<IconBuilding className="size-8 text-primary" />
						</div>
					</div>
					<CardTitle>You're Invited!</CardTitle>
					<CardDescription className="mt-2">
						<span className="font-medium text-foreground">
							{invitation.inviterEmail}
						</span>{" "}
						invited you to join{" "}
						<span className="font-semibold text-foreground">
							{invitation.organizationName}
						</span>{" "}
						as a <span className="font-medium">{invitation.role}</span>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 p-3 bg-muted rounded-lg text-center">
						<p className="text-sm text-muted-foreground">Invitation for</p>
						<p className="font-medium">{invitation.email}</p>
					</div>

					<Tabs
						defaultValue={userExists ? "login" : "signup"}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="signup">New Account</TabsTrigger>
							<TabsTrigger value="login">Existing Account</TabsTrigger>
						</TabsList>

						<TabsContent value="signup">
							<Form {...signupForm}>
								<form
									onSubmit={signupForm.handleSubmit(onSignupSubmit)}
									className="space-y-4"
								>
									<FormField
										control={signupForm.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Full Name</FormLabel>
												<FormControl>
													<Input
														placeholder="John Doe"
														{...field}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={signupForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Create a password"
														{...field}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={signupForm.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirm Password</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Confirm your password"
														{...field}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full"
										disabled={isSubmitting}
									>
										{signUpMutation.isPending ? (
											<>
												<IconLoader2 className="mr-2 size-4 animate-spin" />
												Creating account...
											</>
										) : (
											"Create Account & Join"
										)}
									</Button>
								</form>
							</Form>
						</TabsContent>

						<TabsContent value="login">
							<Form {...loginForm}>
								<form
									onSubmit={loginForm.handleSubmit(onLoginSubmit)}
									className="space-y-4"
								>
									<FormField
										control={loginForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Enter your password"
														{...field}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="submit"
										className="w-full"
										disabled={isSubmitting}
									>
										{signInMutation.isPending ? (
											<>
												<IconLoader2 className="mr-2 size-4 animate-spin" />
												Signing in...
											</>
										) : (
											"Sign In & Join"
										)}
									</Button>
								</form>
							</Form>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
