import { db, usersTable } from "db";
import type { UserInsert, UserUpdate } from "db/types";
import { eq, inArray, isNull } from "db/drizzle-orm";

export const userService = {
	async create(data: UserInsert) {
		const [user] = await db.insert(usersTable).values(data).returning();
		return user;
	},

	async update(id: string, data: UserUpdate) {
		const [user] = await db
			.update(usersTable)
			.set(data)
			.where(eq(usersTable.id, id))
			.returning();
		return user;
	},

	async softDelete(ids: string[]) {
		const users = await db
			.update(usersTable)
			.set({ deleted_at: new Date() })
			.where(inArray(usersTable.id, ids))
			.returning();
		return users;
	},

	async delete(ids: string[]) {
		const users = await db
			.delete(usersTable)
			.where(inArray(usersTable.id, ids))
			.returning();
		return users;
	},

	async restore(ids: string[]) {
		const users = await db
			.update(usersTable)
			.set({ deleted_at: null })
			.where(inArray(usersTable.id, ids))
			.returning();
		return users;
	},

	async fetch(filters?: { includeDeleted?: boolean }) {
		const query = db.select().from(usersTable);

		if (!filters?.includeDeleted) {
			query.where(isNull(usersTable.deleted_at));
		}

		const users = await query;
		return users;
	},
};
