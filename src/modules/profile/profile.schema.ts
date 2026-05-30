import { int, mysqlTable, timestamp, varchar, date } from "drizzle-orm/mysql-core";

export const profile_schema = mysqlTable("profile", {
	id: int("id").autoincrement().primaryKey(),
	first_name: varchar({ length: 255 }).notNull(),
	last_name: varchar({ length: 255 }).notNull(),
	birth_date: date("birth_date", {mode: "string"}).notNull(),	
	address: varchar({ length: 255 }),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp().defaultNow().onUpdateNow()
});

export type profile_insert = typeof profile_schema.$inferInsert;
export type profile_select = typeof profile_schema.$inferSelect;