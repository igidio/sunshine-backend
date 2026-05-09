import { datetime, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const supplier_schema = mysqlTable("supplier", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 1000 }).notNull(),
	phone_number: varchar({ length: 20 }).notNull(),
	image_url: varchar({ length: 2000 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 255 }).notNull(),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});

export type supplier_insert = typeof supplier_schema.$inferInsert;
export type supplier_select = typeof supplier_schema.$inferSelect;