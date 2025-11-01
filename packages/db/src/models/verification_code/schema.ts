import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../user/schema";

export const verificationCodesTable = pgTable("verification_codes", {
	id: uuid().primaryKey().defaultRandom(),
	code: text().notNull(),
	purpose: text({ enum: ["email_verification", "password_reset"] }).notNull(),
	expires_at: timestamp().notNull(),
	user_id: uuid().references(() => usersTable.id, {
		onDelete: "cascade",
	}),
	deleted_at: timestamp(),
	created_at: timestamp().notNull().defaultNow(),
	updated_at: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});
