import db from "~/database"
import { user_schema, type user_insert } from "./user.schema"
import type { MySql2Database } from "drizzle-orm/mysql2";


export const user_repository = {
	create: async (body: user_insert, tx?: MySql2Database) => {
		const database = tx || db;
		return await database.insert(user_schema).values(body);
	}
}