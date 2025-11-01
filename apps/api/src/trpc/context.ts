import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res, info }: CreateFastifyContextOptions) {
	return {
		req: {
			...req,
			headers: {
				...req?.headers,
				authorization:
					info?.connectionParams?.Authorization || req?.headers?.authorization,
			},
		},
		res,
		redis: req?.server?.redis,
		user: undefined,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
