/**
 * Worker Entry Point
 *
 * This file runs in a separate process from the main API server.
 * It processes background jobs from the BullMQ queues.
 *
 * Run with: pnpm run worker
 * Or: tsx watch src/worker.ts (development)
 */

import { initDB, disconnectDB } from "@repo/db";
import {
	createDocumentWorker,
	createEmailWorker,
	closeQueues,
} from "@repo/api/jobs";

// Track workers for graceful shutdown
const workers: { close: () => Promise<void> }[] = [];

async function start() {
	console.log("🚀 Starting worker process...");

	try {
		// Initialize database connection
		await initDB();
		console.log("✅ Database connected");

		// Start workers
		const documentWorker = createDocumentWorker();
		const emailWorker = createEmailWorker();

		workers.push(documentWorker, emailWorker);

		console.log("✅ All workers started and listening for jobs");
		console.log("   - Document worker (concurrency: 2)");
		console.log("   - Email worker (concurrency: 10)");
	} catch (error) {
		console.error("❌ Failed to start workers:", error);
		process.exit(1);
	}
}

async function gracefulShutdown(signal: string) {
	console.log(`\n🛑 Received ${signal}. Shutting down workers gracefully...`);

	try {
		// Close all workers (waits for active jobs to complete)
		await Promise.all(workers.map((worker) => worker.close()));
		console.log("✅ All workers stopped");

		// Close queue connections
		await closeQueues();
		console.log("✅ Queue connections closed");

		// Disconnect from database
		await disconnectDB();
		console.log("✅ Database disconnected");

		console.log("✅ Graceful shutdown complete");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error during shutdown:", error);
		process.exit(1);
	}
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
	console.error("❌ Uncaught exception:", error);
	gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled rejection at:", promise, "reason:", reason);
	// Don't exit - just log. BullMQ handles job failures internally.
});

// Start the workers
start();
