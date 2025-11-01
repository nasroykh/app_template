import { z } from "zod";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { organizationsTable } from "./schema";

export const organizationDetailsSchema = z
	.object({
		logo_url: z.url(),
		website_url: z.url(),
		phone_number: z.string(),
		email: z.email(),
		address: z.string(),
		country: z.string(),
		state: z.string(),
		city: z.string(),
		zip_code: z.string(),
	})
	.partial();

export type OrganizationDetails = z.infer<typeof organizationDetailsSchema>;

export const organizationSelectSchema = createSelectSchema(organizationsTable, {
	organization_details: organizationDetailsSchema,
});
export type Organization = z.infer<typeof organizationSelectSchema>;
export const organizationInsertSchema = createInsertSchema(organizationsTable, {
	organization_details: organizationDetailsSchema,
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
});
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;
export const organizationUpdateSchema = createUpdateSchema(organizationsTable, {
	organization_details: organizationDetailsSchema,
	name: z.string().optional(),
	slug: z.string().optional(),
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
});
export type OrganizationUpdate = z.infer<typeof organizationUpdateSchema>;
