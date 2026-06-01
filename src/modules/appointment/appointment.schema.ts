import { date, int, mysqlTable, datetime, text, time } from "drizzle-orm/mysql-core";
import { customer_schema } from "../customer/customer.schema";
import { treatment_schema } from "../treatment/treatment.schema";

export const appointment_schema = mysqlTable("appointment", {
	id: int("id").autoincrement().primaryKey(),
	customer_id: int("customer_id").notNull().references(() => customer_schema.id),
	treatment_id: int("treatment_id").notNull().references(() => treatment_schema.id),
	date: date("date", { mode: "string" }).notNull(),
	time_start: time("time_start").notNull(),
	time_end: time("time_end").notNull(),
	notes: text(),
	disabled_at: datetime(),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});

export type appointment_select = typeof appointment_schema.$inferSelect;
export type appointment_insert = typeof appointment_schema.$inferInsert;