import { z } from "zod";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { usersTable } from "./schema";

export const userDetailsSchema = z
	.object({
		first_name: z.string(),
		last_name: z.string(),
		full_name: z.string(),
		phone_number: z.string(),
		position: z.string(),
		department: z.string(),
		avatar_url: z.url(),
		address: z.string(),
		birth_date: z.date(),
		country: z.string(),
		state: z.string(),
		city: z.string(),
		zip_code: z.string(),
		preferred_language: z.string(),
		timezone: z.string(),
	})
	.partial();
export type UserDetails = z.infer<typeof userDetailsSchema>;

// User Details Schemas
export const userSelectSchema = createSelectSchema(usersTable, {
	user_details: userDetailsSchema,
});
export type User = z.infer<typeof userSelectSchema>;
export const userInsertSchema = createInsertSchema(usersTable, {
	user_details: userDetailsSchema,
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
});
export type UserInsert = z.infer<typeof userInsertSchema>;
export const userUpdateSchema = createUpdateSchema(usersTable, {
	user_details: userDetailsSchema,
	email: z.email().optional(),
	username: z.string().optional(),
	password_hash: z.string().optional(),
}).omit({
	id: true,
	created_at: true,
	updated_at: true,
});
export type UserUpdate = z.infer<typeof userUpdateSchema>;
