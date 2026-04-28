import { decimal, int, mysqlTable, timestamp, varchar, mysqlEnum, real } from "drizzle-orm/mysql-core";
import type { usersSync } from "drizzle-orm/neon";

export const user_roles = ["superuser", "admin", "employer"] as const;
export type UserRole = (typeof user_roles)[number];

export const user_schema = mysqlTable("user", {
	id: int("id").autoincrement().primaryKey(),
	username: varchar({ length: 255 }).unique().notNull(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).unique().notNull(),
	email_verified_at: timestamp(),
	create_at: timestamp().defaultNow(),
	role: mysqlEnum("user_role", user_roles)
		.default("employer")
		.notNull()
});

export type user_insert = typeof user_schema.$inferInsert;
export type user_select = typeof user_schema.$inferSelect;