import { datetime, int, mysqlEnum, mysqlTable, text } from "drizzle-orm/mysql-core";
import { supplier_schema } from "../supplier/supplier.schema";
import { product_schema } from "../product/product.schema";

export const movement_type = ["purchase", "expired", "damaged", "lost", "adjustment", "internal_use"] as const;
export type MovementType = (typeof movement_type)[number];


export const movement_schema = mysqlTable("movement", {
	id: int("id").autoincrement().primaryKey(),
	supplier_id: int("supplier_id").references(() => supplier_schema.id),
	product_id: int("product_id").notNull().references(() => product_schema.id),
	type: mysqlEnum("movement_type", movement_type).default("purchase").notNull(),
	quantity: int("quantity").notNull().default(0),
	notes: text("notes"),
	created_at: datetime().defaultNow(),
	updated_at: datetime().defaultNow().onUpdateNow(),
	deleted_at: datetime(),
});

export type movement_insert = typeof movement_schema.$inferInsert;
export type movement_select = typeof movement_schema.$inferSelect;