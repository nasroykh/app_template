import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./config/env";

// Use DB_URL if available, otherwise construct from individual variables
const connectionString =
	env.DB_URL ||
	`postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${
		env.DB_PORT
	}/${env.DB_NAME}?sslmode=${env.DB_SSL_MODE || "disable"}`;

const pool = new Pool({
	connectionString,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);

export async function initDB() {
	try {
		const client = await pool.connect();
		client.release();
		console.log("📦 Database connected successfully");
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		console.error("💡 Make sure PostgreSQL is running and the database exists");
		process.exit(1);
	}
}

export async function disconnectDB() {
	await pool.end();
	console.log("📦 Database disconnected");
}

export * from "./models/schema";
export * from "./models/types";
