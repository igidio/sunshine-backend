import { decimal, int, mysqlTable, timestamp, varchar, mysqlEnum, real } from "drizzle-orm/mysql-core";
import { user_schema } from "../user/user.schema";

export const profile_schema = mysqlTable("profile", {
	id: int("id").autoincrement().primaryKey(),
	user_id: int("user_id").notNull().references(() => user_schema.id),
	first_name: varchar({ length: 255 }).notNull(),
	last_name: varchar({ length: 255 }).notNull(),
	phone_number: varchar({ length: 20 }),
	address: varchar({ length: 255 }),
	create_at: timestamp().defaultNow(),
	update_at: timestamp().defaultNow().onUpdateNow()
});