import { datetime, int, mysqlTable } from "drizzle-orm/mysql-core";
import { product_schema } from "../product/product.schema";

export const stock_schema = mysqlTable("stock", {
	id: int("id").autoincrement().primaryKey(),
	product_id: int("product_id").notNull().references(() => product_schema.id),
	quantity: int("quantity").notNull().default(0),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});