import { datetime, int, mysqlTable } from "drizzle-orm/mysql-core";

export const category_schema = mysqlTable("category", {
	id: int("id").autoincrement().primaryKey(),
	name: int("name").notNull().unique(),
	description: int("description").notNull(),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});