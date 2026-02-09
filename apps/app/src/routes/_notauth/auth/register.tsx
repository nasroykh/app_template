import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/_notauth/auth/register")({
	component: RouteComponent,
});

// Form validation schemas
const registerSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.email("Invalid email address"),
		organizationName: z
			.string()
			.min(2, "Organization name must be at least 2 characters"),
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
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [userEmail, setUserEmail] = useState("");
	const [orgName, setOrgName] = useState("");

	const registerForm = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			organizationName: "",
			password: "",
			confirmPassword: "",
		},
	});

	const verificationForm = useForm<VerificationFormValues>({
		resolver: zodResolver(verificationSchema),
		defaultValues: { code: "" },
	});

	// Mutations
	const signUpMutation = useMutation(
		orpc.auth.signUp.mutationOptions({
			onSuccess: (data: any) => {
				if (!data || !data.user) {
					toast.error("Failed to register");
					return;
				}
				setCurrentStep(2);
				setUserEmail(registerForm.getValues("email"));
				setOrgName(registerForm.getValues("organizationName"));
				toast.success("Verification email sent successfully");
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to register");
			},
		}),
	);

	const verifyEmailMutation = useMutation(
		orpc.auth.verifyEmail.mutationOptions({
			onSuccess: async () => {
				// Create organization after email verification
				const slug = orgName
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "");

				createOrgMutation.mutate({
					name: orgName,
					slug: `${slug}-${Date.now()}`,
				});
			},
			onError: (error: any) => {
				toast.error(error.message || "Invalid verification code");
			},
		}),
	);

	const createOrgMutation = useMutation(
		orpc.organization.create.mutationOptions({
			onSuccess: (data: any) => {
				// Set as active organization
				setActiveOrgMutation.mutate({ organizationId: data.id });
			},
			onError: (error: any) => {
				console.error("Failed to create organization:", error);
				// Still proceed - user can create org later
				setCurrentStep(3);
			},
		}),
	);

	const setActiveOrgMutation = useMutation(
		orpc.organization.setActive.mutationOptions({
			onSuccess: () => {
				setCurrentStep(3);
			},
			onError: () => {
				// Still proceed even if setting active fails
				setCurrentStep(3);
			},
		}),
	);

	const resendOtpMutation = useMutation(
		orpc.auth.sendVerificationOtp.mutationOptions({
			onSuccess: () => {
				toast.success("Verification code resent");
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to resend code");
			},
		}),
	);

	const onRegisterSubmit = (data: RegisterFormValues) => {
		signUpMutation.mutate({
			email: data.email,
			name: data.name,
			password: data.password,
		});
	};

	const onVerificationSubmit = (data: VerificationFormValues) => {
		verifyEmailMutation.mutate({
			email: userEmail,
			otp: data.code,
		});
	};

	const handleResendOTP = () => {
		if (!userEmail || resendOtpMutation.isPending) return;
		resendOtpMutation.mutate({ email: userEmail });
	};

	const isLoading =
		signUpMutation.isPending ||
		verifyEmailMutation.isPending ||
		createOrgMutation.isPending ||
		setActiveOrgMutation.isPending;

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
							isLoading={signUpMutation.isPending}
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
												disabled={signUpMutation.isPending}
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
												disabled={signUpMutation.isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={registerForm.control}
								name="organizationName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Organization Name</FormLabel>
										<FormControl>
											<Input
												placeholder="My Company"
												type="text"
												{...field}
												disabled={signUpMutation.isPending}
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
												disabled={signUpMutation.isPending}
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
												disabled={signUpMutation.isPending}
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
										type="button"
										onClick={handleResendOTP}
										disabled={isLoading || resendOtpMutation.isPending}
										className="text-primary hover:underline font-medium disabled:opacity-50"
									>
										{resendOtpMutation.isPending ? "Sending..." : "Resend"}
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
						message="Welcome! Your organization has been created and you're now the owner."
						primaryAction={{
							label: "Go to login",
							onClick: () => navigate({ to: "/auth/login" }),
						}}
					/>
				</StepWrapper>
			)}
		</AuthLayout>
	);
}
