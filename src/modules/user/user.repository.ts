import db from "~/database"
import { user_schema, type user_insert } from "./user.schema"
import type { MySql2Database } from "drizzle-orm/mysql2";
import { eq, or } from "drizzle-orm";


export const user_repository = {
	create: async (body: user_insert, tx?: MySql2Database) => {
		const database = tx || db;
		return await database.insert(user_schema).values(body);
	},
	select_one: async (id: number) => {
		return await db.select().from(user_schema).where(eq(user_schema.id, id))
	},
	select_one_by_username_or_email: async (email_or_username: string) => {
		const results = await db.select().from(user_schema).where(
			or(eq(user_schema.email, email_or_username), eq(user_schema.username, email_or_username))
		).limit(1)
		return results[0]
	}
}