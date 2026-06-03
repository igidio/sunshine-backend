import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { profile_schema } from "~/database/schema";
import type { profile_select } from "../profile/profile.schema";

export const customer_schema = mysqlTable("customer", {
	id: int("id").autoincrement().primaryKey(),
	profile_id: int("profile_id").notNull().references(() => profile_schema.id),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp().defaultNow().onUpdateNow(),
	disabled_at: timestamp(),
	deleted_at: timestamp(),
	phone_number: varchar({ length: 20 }),
});

export type customer_insert = typeof customer_schema.$inferInsert;
export type customer_select = typeof customer_schema.$inferSelect & { profile: profile_select };