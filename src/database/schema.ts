import { decimal, int, mysqlTable, timestamp, varchar, mysqlEnum } from "drizzle-orm/mysql-core";

export const table_users = mysqlTable("user", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  email_verified_at: timestamp(),
  create_at: timestamp().defaultNow(),
  role: mysqlEnum("user_role", ["superuser", "admin", "employer"]).default("employer").notNull()
});

export const table_profile = mysqlTable("profile", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull().references(() => table_users.id),
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
  phone_number: varchar({ length: 20 }),
  address: varchar({ length: 255 }),
  create_at: timestamp().defaultNow(),
  update_at: timestamp().defaultNow().onUpdateNow()
});

export const table_product = mysqlTable("product", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category_id: int("category_id").notNull(),
  image: varchar({ length: 1024 }),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow()
});
