"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Sun, Moon, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export const Route = createFileRoute("/_notauth/auth/login")({
	component: RouteComponent,
});

// Form validation schema
const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function RouteComponent() {
	const loginMutation = useMutation(
		trpc.auth.login.mutationOptions({
			onSuccess: (data) => {
				toast.success("Login successful!");
				console.log("Login successful:", data);
			},
			onError: (error) => {
				toast.error("Login failed. Please check your credentials.");
				console.error("Login failed:", error);
			},
			onSettled: () => {
				setIsLoading(false);
			},
		})
	);

	const [isDark, setIsDark] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Toggle dark mode
	const toggleDarkMode = () => {
		setIsDark(!isDark);
		if (!isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginFormValues) => {
		setIsLoading(true);
		loginMutation.mutate({
			email: data.email,
			password: data.password,
			organization_slug: "",
		});
	};

	return (
		<div
			className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300 ${
				isDark ? "dark" : ""
			}`}
		>
			{/* Dark Mode Toggle */}
			<button
				onClick={toggleDarkMode}
				className="absolute top-6 right-6 p-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
				aria-label="Toggle dark mode"
			>
				{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
			</button>

			{/* Login Card */}
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your account to continue</CardDescription>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							{/* Email Field */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="name@example.com"
												type="email"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Password Field */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your password"
												type="password"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Forgot Password Link */}
							<div className="flex justify-end">
								<Link
									to="/auth/forgot-password"
									className="text-sm text-primary hover:underline font-medium"
								>
									Forgot password?
								</Link>
							</div>

							{/* Submit Button */}
							<Button
								type="submit"
								className="w-full mt-6"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign in"
								)}
							</Button>
						</form>
					</Form>

					{/* Footer Links */}
					<div className="mt-4 text-center text-sm text-muted-foreground">
						<p>
							Don't have an account?{" "}
							<Link
								to="/auth/register"
								className="text-primary hover:underline font-medium"
							>
								Sign up
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Decorative Element */}
			<div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
		</div>
	);
}
