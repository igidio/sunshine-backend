import { int, mysqlTable, timestamp, varchar, mysqlEnum, real, date } from "drizzle-orm/mysql-core";
import { user_schema } from "../user/user.schema";

export const profile_schema = mysqlTable("profile", {
	id: int("id").autoincrement().primaryKey(),
	user_id: int("user_id").notNull().references(() => user_schema.id),
	first_name: varchar({ length: 255 }).notNull(),
	last_name: varchar({ length: 255 }).notNull(),
	birth_date: date("birth_date", {mode: "date"}).notNull(),
	
	address: varchar({ length: 255 }),
	create_at: timestamp().defaultNow(),
	update_at: timestamp().defaultNow().onUpdateNow()
});

export type profile_insert = typeof profile_schema.$inferInsert;
export type profile_select = typeof profile_schema.$inferSelect;