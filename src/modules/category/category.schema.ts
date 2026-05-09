import { datetime, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const category_schema = mysqlTable("category", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar({ length: 60 }).notNull().unique(),
	description: varchar({ length: 255 }).notNull(),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});

export type category_insert = typeof category_schema.$inferInsert;
export type category_select = typeof category_schema.$inferSelect;