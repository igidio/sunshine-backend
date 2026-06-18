import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { user_schema } from "../user/user.schema";

export const confirmation_types = ["recovery", "verification", "add_admin"] as const;
export type ConfirmationType = (typeof confirmation_types)[number];

export const confirmation_schema = mysqlTable("confirmation", {
	id: int("id").autoincrement().primaryKey(),
	token: varchar({ length: 200 }).notNull(),
	type: mysqlEnum("type", confirmation_types).notNull(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp().defaultNow().onUpdateNow(),
	has_used: boolean().default(false).notNull(),
	is_valid: boolean().default(true).notNull(),
	invalidated_by: int("invalidated_by").references(() => user_schema.id),
	expiration_days: int("expiration_days").default(1).notNull(),
	description: text("description"),
});

export type confirmation_insert = typeof confirmation_schema.$inferInsert;
export type confirmation_select = typeof confirmation_schema.$inferSelect;
