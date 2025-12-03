import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	AuthLayout,
	StepWrapper,
	FormStep,
	SuccessStep,
} from "@/components/auth";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_notauth/auth/register")({
	component: RouteComponent,
});

// Form validation schemas
const registerSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

const verificationSchema = z.object({
	code: z.string().length(6, "Verification code must be 6 digits"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;

function RouteComponent() {
	const [currentStep, setCurrentStep] = useState(1);
	const [userEmail, setUserEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const registerForm = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const verificationForm = useForm<VerificationFormValues>({
		resolver: zodResolver(verificationSchema),
		defaultValues: { code: "" },
	});

	const onRegisterSubmit = async (data: RegisterFormValues) => {
		setIsLoading(true);

		try {
			const res = await authClient.signUp.email({
				email: data.email,
				name: data.name,
				password: data.password,
			});

			if (!res.data || res.error) {
				toast.error((res.error && res.error.message) || "Failed to register");
				return;
			}

			console.log(res);
			setCurrentStep(2);
			setUserEmail(data.email);
			toast.success("Verification email sent successfully");
		} catch (error) {
			toast.error("Failed to send verification email");
			console.error("Failed to send verification email:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const onVerificationSubmit = async (data: VerificationFormValues) => {
		setIsLoading(true);
		try {
			console.log(data);

			const res = await authClient.emailOtp.verifyEmail({
				email: userEmail,
				otp: data.code,
			});

			if (!res.data || res.error) {
				toast.error(
					(res.error && res.error.message) || "Invalid verification code"
				);
				return;
			}

			console.log(res);
			setCurrentStep(3);
		} catch (error) {
			toast.error("Failed to verify email");
			console.error("Failed to verify email:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setCurrentStep(1);
		registerForm.reset();
		verificationForm.reset();
		setUserEmail("");
	};

	return (
		<AuthLayout
			totalSteps={3}
			currentStep={currentStep}
			onBack={() => setCurrentStep(currentStep - 1)}
			showBackButton={currentStep === 2}
		>
			{currentStep === 1 && (
				<StepWrapper
					title="Create account"
					description="Join us today and get started"
				>
					<Form {...registerForm}>
						<FormStep
							onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
							isLoading={isLoading}
							submitText="Continue"
							footerContent={
								<>
									Already have an account?{" "}
									<Link
										to="/auth/login"
										className="text-primary hover:underline font-medium"
									>
										Sign in
									</Link>
								</>
							}
						>
							<FormField
								control={registerForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input
												placeholder="John Doe"
												type="text"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={registerForm.control}
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
							<FormField
								control={registerForm.control}
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
							<FormField
								control={registerForm.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Confirm your password"
												type="password"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormStep>
					</Form>
				</StepWrapper>
			)}

			{currentStep === 2 && (
				<StepWrapper
					title="Verify email"
					description={`We sent a 6-digit code to ${userEmail}`}
				>
					<Form {...verificationForm}>
						<FormStep
							onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
							isLoading={isLoading}
							submitText="Verify email"
							footerContent={
								<>
									Didn't receive a code?{" "}
									<button
										onClick={() => console.log("Resend code")}
										disabled={isLoading}
										className="text-primary hover:underline font-medium disabled:opacity-50"
									>
										Resend
									</button>
								</>
							}
						>
							<FormField
								control={verificationForm.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Verification Code</FormLabel>
										<FormControl>
											<Input
												placeholder="000000"
												type="text"
												inputMode="numeric"
												maxLength={6}
												{...field}
												disabled={isLoading}
												className="tracking-widest text-center text-lg font-semibold"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormStep>
					</Form>
				</StepWrapper>
			)}

			{currentStep === 3 && (
				<StepWrapper
					title="Account created!"
					description="Your account has been successfully created"
				>
					<SuccessStep
						email={userEmail}
						title="Account created!"
						message="Welcome! Your email has been verified and your account is ready to use."
						primaryAction={{
							label: "Go to login",
							onClick: () => (window.location.href = "/auth/login"),
						}}
						secondaryAction={{
							label: "Create another account",
							onClick: handleReset,
						}}
					/>
				</StepWrapper>
			)}
		</AuthLayout>
	);
}
