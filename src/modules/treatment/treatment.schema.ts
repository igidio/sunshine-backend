import { int, mysqlTable, real, timestamp, varchar } from "drizzle-orm/mysql-core";

export const treatment_schema = mysqlTable("treatment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 2000 }).notNull(),
  price: real({ precision: 10, scale: 2 }).notNull(),
  duration: int("duration_minutes").notNull(),
	disabled_at: timestamp(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp().defaultNow().onUpdateNow(),
	deleted_at: timestamp(),
});

export type treatment_insert = typeof treatment_schema.$inferInsert;
export type treatment_select = typeof treatment_schema.$inferSelect;