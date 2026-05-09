import { int, mysqlEnum, mysqlTable, real, timestamp } from "drizzle-orm/mysql-core";
import { customer_schema } from "../customer/customer.schema";
import { product_schema } from "../product/product.schema";
import { user_schema } from "../user/user.schema";
import { treatment_schema } from "../treatment/treatment.schema";

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

export const sale_treatment_detail_schema = mysqlTable("sale_treatment_detail", {
  id: int("id").autoincrement().primaryKey(),
  sale_id: int("sale_id").notNull().references(() => sale_schema.id),
  treatment_id: int("treatment_id").notNull().references(() => treatment_schema.id),
  staff_id: int("staff_id").notNull().references(() => user_schema.id),
  price: real({ precision: 10, scale: 2 }).notNull(),
});