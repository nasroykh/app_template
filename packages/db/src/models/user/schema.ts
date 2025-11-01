import {
	pgTable,
	uuid,
	text,
	timestamp,
	unique,
	jsonb,
	index,
} from "drizzle-orm/pg-core";
import { organizationsTable } from "../organization/schema";
import { UserDetails } from "./types";

export const usersTable = pgTable(
	"users",
	{
		id: uuid().primaryKey().defaultRandom(),
		email: text().notNull(),
		username: text().notNull(),
		password_hash: text().notNull(),
		role: text({ enum: ["admin", "user"] })
			.notNull()
			.default("admin"),
		status: text({ enum: ["online", "offline"] })
			.notNull()
			.default("online"),
		email_verified_at: timestamp(),
		last_seen_at: timestamp(),
		user_details: jsonb().$type<UserDetails>().notNull(),
		organization_id: uuid().references(() => organizationsTable.id, {
			onDelete: "cascade",
		}),
		deleted_at: timestamp(),
		created_at: timestamp().notNull().defaultNow(),
		updated_at: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		unique_email_org: unique().on(table.email, table.organization_id),
		unique_username_org: unique().on(table.username, table.organization_id),
		idx_user_email: index().on(table.email),
		idx_user_username: index().on(table.username),
		idx_user_organization_id: index().on(table.organization_id),
		idx_user_role: index().on(table.role),
	})
);
