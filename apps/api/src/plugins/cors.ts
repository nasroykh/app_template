import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";

export const registerCors = async (server: FastifyInstance) => {
	await server.register(cors, {
		origin: true, // Allow all origins in development
		credentials: true,
	});
};
