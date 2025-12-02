import { config as dotenvConfig } from "dotenv";

// Load environment variables
dotenvConfig({ override: true, quiet: true });
// packages/auth/src/index.ts

export { createAuth, type Auth } from "./server";
