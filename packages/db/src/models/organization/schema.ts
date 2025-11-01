import {
	pgTable,
	uuid,
	text,
	timestamp,
	jsonb,
	index,
} from "drizzle-orm/pg-core";
import { OrganizationDetails } from "./types";

export const organizationsTable = pgTable(
	"organizations",
	{
		id: uuid().primaryKey().defaultRandom(),
		name: text().notNull(),
		slug: text().notNull().unique(),
		organization_details: jsonb().$type<OrganizationDetails>(),
		deleted_at: timestamp(),
		created_at: timestamp().notNull().defaultNow(),
		updated_at: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		idx_name_org: index().on(table.name),
	})
);
