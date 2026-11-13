import { int, mysqlTable, timestamp, varchar, mysqlEnum } from "drizzle-orm/mysql-core";
import { profile_schema } from "../profile/profile.schema";
import { text } from "drizzle-orm/mysql-core";

export const user_roles = ["superuser", "admin", "employer", "customer"] as const;
export type UserRole = (typeof user_roles)[number];

export const user_schema = mysqlTable("user", {
	id: int("id").autoincrement().primaryKey(),
	username: varchar({ length: 255 }).unique().notNull(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).unique().notNull(),
	email_verified_at: timestamp(),
	phone_number: varchar({ length: 20 }),
	created_at: timestamp().defaultNow(),
	role: mysqlEnum("user_role", user_roles)
		.default("employer")
		.notNull(),
	profile_id: int("profile_id").notNull().references(() => profile_schema.id),
	updated_at: timestamp().defaultNow().onUpdateNow(),
	disabled_at: timestamp(),
	permissions: text("permissions").notNull().default(""),
	chat_access: varchar({ length: 255 }),
	telegram_id: varchar({ length: 255 }).unique(),
});

export type user_insert = typeof user_schema.$inferInsert;
export type user_select = typeof user_schema.$inferSelect;