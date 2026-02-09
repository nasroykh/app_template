import { auth } from "../config/auth";

// =============================================================================
// Types
// =============================================================================

export type SignInInput = {
	email: string;
	password: string;
};

export type SignUpInput = {
	email: string;
	password: string;
	name: string;
};

export type VerifyEmailInput = {
	email: string;
	otp: string;
};

export type ResetPasswordInput = {
	email: string;
	otp: string;
	newPassword: string;
};

export type UpdateProfileInput = {
	name?: string;
	image?: string;
};

// =============================================================================
// Auth Operations
// =============================================================================

export async function signInEmail(input: SignInInput, headers: Headers) {
	return auth.api.signInEmail({
		body: {
			email: input.email,
			password: input.password,
		},
		headers,
	});
}

export async function signUpEmail(input: SignUpInput, headers: Headers) {
	return auth.api.signUpEmail({
		body: {
			email: input.email,
			password: input.password,
			name: input.name,
		},
		headers,
	});
}

export async function signOut(headers: Headers) {
	return auth.api.signOut({
		headers,
	});
}

export async function getSession(headers: Headers) {
	return auth.api.getSession({
		headers,
	});
}

// =============================================================================
// Email OTP Operations
// =============================================================================

export async function sendVerificationOtp(email: string, headers: Headers) {
	return auth.api.sendVerificationOTP({
		body: { email, type: "email-verification" },
		headers,
	});
}

export async function verifyEmailOtp(
	input: VerifyEmailInput,
	headers: Headers,
) {
	return auth.api.verifyEmailOTP({
		body: {
			email: input.email,
			otp: input.otp,
		},
		headers,
	});
}

export async function forgetPasswordOtp(email: string, headers: Headers) {
	return auth.api.forgetPasswordEmailOTP({
		body: { email },
		headers,
	});
}

export async function checkVerificationOtp(
	input: VerifyEmailInput,
	headers: Headers,
) {
	return auth.api.checkVerificationOTP({
		body: { email: input.email, otp: input.otp, type: "forget-password" },
		headers,
	});
}

export async function resetPasswordWithOtp(
	input: ResetPasswordInput,
	headers: Headers,
) {
	return auth.api.resetPasswordEmailOTP({
		body: {
			email: input.email,
			otp: input.otp,
			password: input.newPassword,
		},
		headers,
	});
}

// =============================================================================
// Profile Operations
// =============================================================================

export async function updateProfile(
	input: UpdateProfileInput,
	headers: Headers,
) {
	return auth.api.updateUser({
		body: input,
		headers,
	});
}
