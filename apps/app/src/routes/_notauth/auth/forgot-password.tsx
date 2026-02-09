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

export const Route = createFileRoute("/_notauth/auth/forgot-password")({
	component: RouteComponent,
});

// Form validation schemas
const emailSchema = z.object({
	email: z.email("Invalid email address"),
});

const verificationSchema = z.object({
	code: z.string().length(6, "Verification code must be 6 digits"),
});

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type EmailFormValues = z.infer<typeof emailSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function RouteComponent() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [userEmail, setUserEmail] = useState("");
	const [otp, setOtp] = useState("");

	const emailForm = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: "" },
	});

	const verificationForm = useForm<VerificationFormValues>({
		resolver: zodResolver(verificationSchema),
		defaultValues: { code: "" },
	});

	const resetPasswordForm = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	// Mutations
	const forgetPasswordMutation = useMutation(
		orpc.auth.forgetPassword.mutationOptions({
			onSuccess: () => {
				toast.success("Reset email sent");
				setUserEmail(emailForm.getValues("email"));
				setCurrentStep(2);
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to send reset email");
			},
		}),
	);

	const checkOtpMutation = useMutation(
		orpc.auth.checkVerificationOtp.mutationOptions({
			onSuccess: () => {
				toast.success("Verification successful");
				setOtp(verificationForm.getValues("code"));
				setCurrentStep(3);
			},
			onError: (error: any) => {
				toast.error(error.message || "Invalid verification code");
			},
		}),
	);

	const resetPasswordMutation = useMutation(
		orpc.auth.resetPassword.mutationOptions({
			onSuccess: () => {
				toast.success("Password reset successful");
				setCurrentStep(4);
			},
			onError: (error: any) => {
				toast.error(error.message || "Password reset failed");
			},
		}),
	);

	const resendOtpMutation = useMutation(
		orpc.auth.forgetPassword.mutationOptions({
			onSuccess: () => {
				toast.success("Reset code resent");
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to resend code");
			},
		}),
	);

	const onEmailSubmit = (data: EmailFormValues) => {
		forgetPasswordMutation.mutate({ email: data.email });
	};

	const onVerificationSubmit = (data: VerificationFormValues) => {
		checkOtpMutation.mutate({ email: userEmail, otp: data.code });
	};

	const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
		resetPasswordMutation.mutate({
			email: userEmail,
			otp,
			newPassword: data.password,
		});
	};

	const handleResendOTP = () => {
		if (!userEmail || resendOtpMutation.isPending) return;
		resendOtpMutation.mutate({ email: userEmail });
	};

	const handleReset = () => {
		setCurrentStep(1);
		emailForm.reset();
		verificationForm.reset();
		resetPasswordForm.reset();
		setUserEmail("");
	};

	const isLoading =
		forgetPasswordMutation.isPending ||
		checkOtpMutation.isPending ||
		resetPasswordMutation.isPending;

	return (
		<AuthLayout
			totalSteps={4}
			currentStep={currentStep}
			onBack={() => setCurrentStep(currentStep - 1)}
			showBackButton={currentStep !== 1 && currentStep !== 4}
		>
			{currentStep === 1 && (
				<StepWrapper
					title="Reset password"
					description="We'll send you an email to reset your password"
				>
					<Form {...emailForm}>
						<FormStep
							onSubmit={emailForm.handleSubmit(onEmailSubmit)}
							isLoading={forgetPasswordMutation.isPending}
							submitText="Send reset link"
							footerContent={
								<>
									Remember your password?{" "}
									<Link
										to="/auth/login"
										className="text-primary hover:underline font-medium"
									>
										Back to login
									</Link>
								</>
							}
						>
							<FormField
								control={emailForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="name@example.com"
												type="email"
												{...field}
												disabled={forgetPasswordMutation.isPending}
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
							submitText="Verify code"
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
					title="Set new password"
					description="Create a strong password for your account"
				>
					<Form {...resetPasswordForm}>
						<FormStep
							onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
							isLoading={isLoading}
							submitText="Reset password"
						>
							<FormField
								control={resetPasswordForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter new password"
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
								control={resetPasswordForm.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Confirm new password"
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

			{currentStep === 4 && (
				<StepWrapper
					title="Password reset!"
					description="Your password has been successfully reset"
				>
					<SuccessStep
						email={userEmail}
						title="Password reset!"
						message="Your password has been updated. You can now log in with your new password."
						primaryAction={{
							label: "Go to login",
							onClick: () => navigate({ to: "/auth/login" }),
						}}
						secondaryAction={{
							label: "Reset another account",
							onClick: handleReset,
						}}
					/>
				</StepWrapper>
			)}
		</AuthLayout>
	);
}
