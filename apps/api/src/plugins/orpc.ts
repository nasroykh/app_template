import { FastifyInstance } from "fastify";
import { RPCHandler } from "@orpc/server/fastify";
import { onError } from "@orpc/server";
import { router } from "../orpc/router";

const handler = new RPCHandler(router, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const registerORPC = async (server: FastifyInstance) => {
	server.all("/api/rpc/*", async (req, reply) => {
		const headers = new Headers();

		for (const [key, value] of Object.entries(req.headers)) {
			if (value === undefined) continue;
			if (Array.isArray(value)) {
				value.forEach((v) => headers.append(key, v));
			} else {
				headers.append(key, value);
			}
		}

		const { matched } = await handler.handle(req, reply, {
			prefix: "/api/rpc",
			context: {
				headers,
			},
		});

		if (!matched) {
			reply.status(404).send("Not found");
		}
	});
};
