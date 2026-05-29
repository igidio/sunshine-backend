import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { profile_schema } from "~/database/schema";

export const customer_schema = mysqlTable("customer", {
	id: int("id").autoincrement().primaryKey(),
	profile_id: int("profile_id").notNull().references(() => profile_schema.id),
	disabled_at: timestamp(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp().defaultNow().onUpdateNow(),
	phone_number: varchar({ length: 20 }),
});

export type customer_insert = typeof customer_schema.$inferInsert;
export type customer_select = typeof customer_schema.$inferSelect;