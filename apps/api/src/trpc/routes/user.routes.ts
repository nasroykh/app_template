import { z } from "zod";
import { userInsertSchema, userUpdateSchema } from "db/types";
import { publicProcedure, router } from "../trpc";
import { userService } from "../../services/user.service";

const userRouter = router({
	create: publicProcedure
		.input(userInsertSchema)
		.mutation(async ({ input }) => {
			return await userService.create(input);
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				data: userUpdateSchema,
			})
		)
		.mutation(async ({ input }) => {
			return await userService.update(input.id, input.data);
		}),

	softDelete: publicProcedure
		.input(z.object({ ids: z.array(z.string().uuid()) }))
		.mutation(async ({ input }) => {
			return await userService.softDelete(input.ids);
		}),

	delete: publicProcedure
		.input(z.object({ ids: z.array(z.string().uuid()) }))
		.mutation(async ({ input }) => {
			return await userService.delete(input.ids);
		}),

	restore: publicProcedure
		.input(z.object({ ids: z.array(z.string().uuid()) }))
		.mutation(async ({ input }) => {
			return await userService.restore(input.ids);
		}),

	fetch: publicProcedure
		.input(z.object({ includeDeleted: z.boolean().optional() }).optional())
		.query(async ({ input }) => {
			return await userService.fetch(input);
		}),
});

export { userRouter };
