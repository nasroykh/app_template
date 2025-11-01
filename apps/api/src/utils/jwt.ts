import jwt, { type SignOptions } from "jsonwebtoken";
import { type User } from "db/types";

export interface JWTPayload {
	userId: User["id"];
	email: User["email"];
	organizationId: User["organization_id"];
	role: User["role"];
}

export interface RefreshTokenPayload {
	userId: User["id"];
}

// Validate and cache environment variables at module load
const getEnvConfig = () => {
	const JWT_SECRET = process.env.JWT_SECRET;
	const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
	const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
	const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

	if (!JWT_SECRET) {
		throw new Error("JWT_SECRET is not set");
	}
	if (!JWT_EXPIRES_IN) {
		throw new Error("JWT_EXPIRES_IN is not set");
	}
	if (!JWT_REFRESH_SECRET) {
		throw new Error("JWT_REFRESH_SECRET is not set");
	}
	if (!JWT_REFRESH_EXPIRES_IN) {
		throw new Error("JWT_REFRESH_EXPIRES_IN is not set");
	}

	return {
		JWT_SECRET,
		JWT_EXPIRES_IN,
		JWT_REFRESH_SECRET,
		JWT_REFRESH_EXPIRES_IN,
	};
};

// Lazy initialization of config
let envConfig: ReturnType<typeof getEnvConfig> | null = null;
const getConfig = () => {
	if (!envConfig) {
		envConfig = getEnvConfig();
	}
	return envConfig;
};

// Shared error handler for token verification
const handleVerificationError = (
	error: unknown,
	tokenType: "access" | "refresh"
): never => {
	if (error instanceof jwt.TokenExpiredError) {
		throw new Error(
			`${tokenType === "access" ? "Token" : "Refresh token"} expired`
		);
	}
	if (error instanceof jwt.JsonWebTokenError) {
		throw new Error(
			`Invalid ${tokenType === "access" ? "token" : "refresh token"}`
		);
	}
	throw new Error(
		`${tokenType === "access" ? "Token" : "Refresh token"} verification failed`
	);
};

export const jwtUtils = {
	generateAccessToken(payload: JWTPayload): string {
		const { JWT_SECRET, JWT_EXPIRES_IN } = getConfig();
		return jwt.sign(payload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		} as SignOptions);
	},

	generateRefreshToken(payload: RefreshTokenPayload): string {
		const { JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = getConfig();
		return jwt.sign(payload, JWT_REFRESH_SECRET, {
			expiresIn: JWT_REFRESH_EXPIRES_IN,
		} as SignOptions);
	},

	verifyAccessToken(token: string): JWTPayload {
		const { JWT_SECRET } = getConfig();
		try {
			return jwt.verify(token, JWT_SECRET) as JWTPayload;
		} catch (error) {
			return handleVerificationError(error, "access");
		}
	},

	verifyRefreshToken(token: string): RefreshTokenPayload {
		const { JWT_REFRESH_SECRET } = getConfig();
		try {
			return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
		} catch (error) {
			return handleVerificationError(error, "refresh");
		}
	},

	extractTokenFromHeader(authHeader?: string): string | null {
		if (!authHeader?.startsWith("Bearer ")) {
			return null;
		}
		return authHeader.slice(7);
	},

	generateTokenPair(userPayload: JWTPayload) {
		return {
			accessToken: this.generateAccessToken(userPayload),
			refreshToken: this.generateRefreshToken({
				userId: userPayload.userId,
			}),
		};
	},
};
