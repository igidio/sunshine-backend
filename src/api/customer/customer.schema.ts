import { int, mysqlTable } from "drizzle-orm/mysql-core";
import { profile_schema } from "~/database/schema";

export const customer_schema = mysqlTable("customer", {
	id: int("id").autoincrement().primaryKey(),
	profile_id: int("profile_id").notNull().references(() => profile_schema.id),
})