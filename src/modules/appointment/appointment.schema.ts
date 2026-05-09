import { date, int, mysqlTable, datetime, text, time } from "drizzle-orm/mysql-core";
import { customer_schema } from "../customer/customer.schema";

export const appointment_schema = mysqlTable("appointment", {
	id: int("id").autoincrement().primaryKey(),
	customer_id: int("customer_id").notNull().references(() => customer_schema.id),
	date: date("date", { mode: "date" }).notNull(),
	time: time("time").notNull(),
	notes: text(),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});

export type appointment_select = typeof appointment_schema.$inferSelect;
export type appointment_insert = typeof appointment_schema.$inferInsert;