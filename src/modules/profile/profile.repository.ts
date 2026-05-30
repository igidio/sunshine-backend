import type z from "zod";
import { profile_schema, type profile_insert } from "./profile.schema";
import db from "~/database";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";

export const profile_repository = {
	create: async (body: profile_insert,  tx?: MySql2Database) => {
		const database = tx || db;
		return await database.insert(profile_schema).values(body).$returningId();
	},

	update: async (id: number, data: Partial<profile_insert>, tx?: MySql2Database) => {		

		const database = tx || db;
		const [result] = await database
			.update(profile_schema)
			.set(data)
			.where(eq(profile_schema.id, id))
			.execute();
		return result;
	}
}