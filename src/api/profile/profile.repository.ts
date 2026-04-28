import type z from "zod";
import { profile_schema, type profile_insert } from "./profle.schema";
import db from "~/database";
import type { MySql2Database } from "drizzle-orm/mysql2";

export const profile_repository = {
	create: async (body: profile_insert,  tx?: MySql2Database) => {
		const database = tx || db;
		return await database.insert(profile_schema).values(body);
	}
}