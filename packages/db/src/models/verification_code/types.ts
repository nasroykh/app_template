import { z } from "zod";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { verificationCodesTable } from "./schema";

// User Details Schemas
export const verificationCodeSelectSchema = createSelectSchema(
	verificationCodesTable
);
export type VerificationCode = z.infer<typeof verificationCodeSelectSchema>;
export const verificationCodeInsertSchema = createInsertSchema(
	verificationCodesTable
).omit({
	id: true,
	created_at: true,
	updated_at: true,
});
export type VerificationCodeInsert = z.infer<
	typeof verificationCodeInsertSchema
>;
export const verificationCodeUpdateSchema = createUpdateSchema(
	verificationCodesTable,
	{
		code: z.string().optional(),
	}
).omit({
	id: true,
	created_at: true,
	updated_at: true,
});
export type VerificationCodeUpdate = z.infer<
	typeof verificationCodeUpdateSchema
>;
