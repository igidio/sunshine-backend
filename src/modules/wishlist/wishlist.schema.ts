import { int, mysqlTable, timestamp, unique } from "drizzle-orm/mysql-core";
import { customer_schema } from "../customer/customer.schema";
import { product_schema } from "../product/product.schema";

export const wishlist_schema = mysqlTable("wishlist", {
	id: int("id").autoincrement().primaryKey(),
	product_id: int("product_id").notNull().references(() => product_schema.id),
	customer_id: int("customer_id").notNull().references(() => customer_schema.id),
	added_at: timestamp().defaultNow(),
}, (table) => ({
	unique_customer_product: unique("unique_customer_product").on(table.customer_id, table.product_id),
}));

export type wishlist_insert = typeof wishlist_schema.$inferInsert;
export type wishlist_select = typeof wishlist_schema.$inferSelect;
