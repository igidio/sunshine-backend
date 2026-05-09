import { decimal, int, mysqlTable, timestamp, varchar, mysqlEnum, real } from "drizzle-orm/mysql-core";
import { category_schema } from "../category/category.schema";

export const product_schema = mysqlTable("product", {
  id: int("id").autoincrement().primaryKey(),
  category_id: int("category_id").notNull().references(() => category_schema.id),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }).notNull(),
  price: real({ precision: 10, scale: 2 }).notNull(),
  image: varchar({ length: 1024 }),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
  deleted_at: timestamp(),
});