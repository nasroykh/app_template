import { db, organizationsTable } from "db";
import type { OrganizationInsert, OrganizationUpdate } from "db/types";
import { eq, inArray, isNull } from "db/drizzle-orm";

export const organizationService = {
	async create(data: OrganizationInsert) {
		const [organization] = await db
			.insert(organizationsTable)
			.values(data)
			.returning();
		return organization;
	},

	async update(id: string, data: OrganizationUpdate) {
		const [organization] = await db
			.update(organizationsTable)
			.set(data)
			.where(eq(organizationsTable.id, id))
			.returning();
		return organization;
	},

	async softDelete(ids: string[]) {
		const organizations = await db
			.update(organizationsTable)
			.set({ deleted_at: new Date() })
			.where(inArray(organizationsTable.id, ids))
			.returning();
		return organizations;
	},

	async delete(ids: string[]) {
		const organizations = await db
			.delete(organizationsTable)
			.where(inArray(organizationsTable.id, ids))
			.returning();
		return organizations;
	},

	async restore(ids: string[]) {
		const organizations = await db
			.update(organizationsTable)
			.set({ deleted_at: null })
			.where(inArray(organizationsTable.id, ids))
			.returning();
		return organizations;
	},

	async fetch(filters?: { includeDeleted?: boolean }) {
		const query = db.select().from(organizationsTable);

		if (!filters?.includeDeleted) {
			query.where(isNull(organizationsTable.deleted_at));
		}

		const organizations = await query;
		return organizations;
	},
};
