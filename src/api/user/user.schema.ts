import { decimal, int, mysqlTable, timestamp, varchar, mysqlEnum, real } from "drizzle-orm/mysql-core";

export const user_schema = mysqlTable("user", {
	id: int("id").autoincrement().primaryKey(),
	username: varchar({ length: 255 }).unique().notNull(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).unique().notNull(),
	email_verified_at: timestamp(),
	create_at: timestamp().defaultNow(),
	role: mysqlEnum("user_role", ["superuser", "admin", "employer"])
		.default("employer")
		.notNull()
});
