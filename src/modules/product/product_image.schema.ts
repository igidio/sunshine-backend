import { int, mysqlTable, timestamp, varchar,  } from "drizzle-orm/mysql-core";
import { product_schema } from "./product.schema";

export const product_image_schema = mysqlTable("product_image", {
	id: int("id").autoincrement().primaryKey(),
	product_id: int("product_id").notNull().references(() => product_schema.id),
	image_url: varchar({ length: 2000 }).notNull(),
	created_at: timestamp().defaultNow(),
	updated_at: timestamp().defaultNow().onUpdateNow(),
	deleted_at: timestamp(),
});

export type product_image_select = typeof product_image_schema.$inferSelect;
export type product_image_insert = typeof product_image_schema.$inferInsert;