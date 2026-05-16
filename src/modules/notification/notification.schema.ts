import { int, mysqlEnum, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";
import { user_schema } from "../user/user.schema";

export const notification_types = ["info", "warning", "error", "success"] as const;
export type NotificationType = (typeof notification_types)[number];

export const notification_schema = mysqlTable("notification", {
	id: int("id").autoincrement().primaryKey(),
	user_id: int("user_id").notNull().references(() => user_schema.id),
	title: text("title").notNull(),
	message: text("message").notNull(),
	created_at: timestamp("created_at").defaultNow(),
	deleted_at: timestamp("deleted_at"),
	read_at: timestamp("readed_at"),
	goto_url: text("goto_url"),
	type: mysqlEnum("type", notification_types).default("info").notNull(),
});

export type notification_insert = typeof notification_schema.$inferInsert;
export type notification_select = typeof notification_schema.$inferSelect;