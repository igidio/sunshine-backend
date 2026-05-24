import { datetime, int, mysqlTable } from "drizzle-orm/mysql-core";
import { supplier_schema } from "../supplier/supplier.schema";
import { product_schema } from "../product/product.schema";

export const addition_schema = mysqlTable("addition", {
	id: int("id").autoincrement().primaryKey(),
	supplier_id: int("supplier_id").notNull().references(() => supplier_schema.id),
	product_id: int("product_id").notNull().references(() => product_schema.id),
	quantity: int("quantity").notNull().default(0),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});