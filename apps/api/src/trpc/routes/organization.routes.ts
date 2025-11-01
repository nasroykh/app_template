import { z } from "zod";
import { organizationInsertSchema, organizationUpdateSchema } from "db/types";
import { publicProcedure, router } from "../trpc";
import { organizationService } from "../../services/organization.service";

const organizationRouter = router({
	create: publicProcedure
		.input(organizationInsertSchema)
		.mutation(async ({ input }) => {
			return await organizationService.create(input);
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.uuid(),
				data: organizationUpdateSchema,
			})
		)
		.mutation(async ({ input }) => {
			return await organizationService.update(input.id, input.data);
		}),

	softDelete: publicProcedure
		.input(z.object({ ids: z.array(z.uuid()) }))
		.mutation(async ({ input }) => {
			return await organizationService.softDelete(input.ids);
		}),

	delete: publicProcedure
		.input(z.object({ ids: z.array(z.uuid()) }))
		.mutation(async ({ input }) => {
			return await organizationService.delete(input.ids);
		}),

	restore: publicProcedure
		.input(z.object({ ids: z.array(z.uuid()) }))
		.mutation(async ({ input }) => {
			return await organizationService.restore(input.ids);
		}),

	fetch: publicProcedure
		.input(z.object({ includeDeleted: z.boolean().optional() }).optional())
		.query(async ({ input }) => {
			return await organizationService.fetch(input);
		}),
});

export { organizationRouter };
