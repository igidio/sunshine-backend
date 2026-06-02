import { int, mysqlEnum, mysqlTable, real, timestamp } from "drizzle-orm/mysql-core";
import { customer_schema } from "../customer/customer.schema";
import { product_schema } from "../product/product.schema";
import { user_schema } from "../user/user.schema";
import { treatment_schema } from "../treatment/treatment.schema";
import { appointment_schema } from "../appointment/appointment.schema";

export const sale_schema = mysqlTable("sale", {
	id: int("id").autoincrement().primaryKey(),
	customer_id: int("customer_id").notNull().references(() => customer_schema.id),
	total: real({ precision: 10, scale: 2 }).notNull(),
	payment_method: mysqlEnum("payment_method", ["cash", "card", "transfer"]).notNull(),
	created_at: timestamp().defaultNow()
})

export const sale_product_detail_schema = mysqlTable("sale_product_detail", {
  id: int("id").autoincrement().primaryKey(),
  sale_id: int("sale_id").notNull().references(() => sale_schema.id),
  product_id: int("product_id").notNull().references(() => product_schema.id),
  quantity: int("quantity").notNull(),
  unit_price: real({ precision: 10, scale: 2 }).notNull(),
});

export const sale_appointment_detail_schema = mysqlTable("sale_appointment_detail", {
  id: int("id").autoincrement().primaryKey(),
  sale_id: int("sale_id").notNull().references(() => sale_schema.id),
  appointment_id: int("appointment_id").notNull().references(() => appointment_schema.id),
  price: real({ precision: 10, scale: 2 }).notNull(),
});

export type sale_insert = typeof sale_schema.$inferInsert;
export type sale_select = typeof sale_schema.$inferSelect;
export type sale_product_detail_insert = typeof sale_product_detail_schema.$inferInsert;
export type sale_product_detail_select = typeof sale_product_detail_schema.$inferSelect;
export type sale_appointment_detail_insert = typeof sale_appointment_detail_schema.$inferInsert;
export type sale_appointment_detail_select = typeof sale_appointment_detail_schema.$inferSelect;