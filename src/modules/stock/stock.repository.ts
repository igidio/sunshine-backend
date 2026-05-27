import db from "~/database";
import { stock_schema, type stock_insert } from "./stock.schema";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { and, eq, isNull } from "drizzle-orm";

export const stock_repository = {
	find_one: async (id: number, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.select()
			.from(stock_schema)
			.where(and(eq(stock_schema.id, id), isNull(stock_schema.deleted_at)));
		return result;
	},

	find_by_product_id: async (product_id: number, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.select()
			.from(stock_schema)
			.where(and(eq(stock_schema.product_id, product_id), isNull(stock_schema.deleted_at)));
		return result;
	},

	create: async (data: stock_insert, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database.insert(stock_schema).values(data).$returningId();
		return result;
	},

	update_quantity: async (id: number, quantity: number, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(stock_schema)
			.set({ quantity })
			.where(and(eq(stock_schema.id, id), isNull(stock_schema.deleted_at)))
			.execute();
		return result;
	},

	delete: async (id: number, tx?: MySql2Database) => {
		const database = tx || db;
		return await database
			.update(stock_schema)
			.set({ deleted_at: new Date() })
			.where(and(eq(stock_schema.id, id), isNull(stock_schema.deleted_at)))
			.execute();
	},
};
