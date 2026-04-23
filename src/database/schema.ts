import { int, mysqlTable, serial, timestamp, varchar, mysqlEnum } from "drizzle-orm/mysql-core";


export const users_table = mysqlTable("users", {
	id: int().autoincrement(),
	username: varchar({ length: 255 }).unique().notNull(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).unique(),
	email_verified_at: timestamp(),
	create_at: timestamp().defaultNow(),
	update_at: timestamp().defaultNow().onUpdateNow(),
	role: mysqlEnum("user_role", ["superuser", "admin", "employer"]).default("employer").notNull()
});