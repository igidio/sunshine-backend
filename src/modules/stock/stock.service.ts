import { stock_repository } from "./stock.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { MySql2Database } from "drizzle-orm/mysql2";

export const stock_service = {
	get_one: async (id: number) => {
		const stock = await stock_repository.find_one(id);
		if (!stock) throw new ServerError(error_messages.stock_not_found, 404);
		return stock;
	},

	get_by_product: async (product_id: number, tx?: MySql2Database) => {
		const stock = await stock_repository.find_by_product_id(product_id, tx);
		if (!stock) throw new ServerError(error_messages.stock_not_found, 404);
		return stock;
	},

	create: async (product_id: number, quantity = 0, tx?: MySql2Database) => {
		const result = await stock_repository.create({ product_id, quantity }, tx);
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		return await stock_repository.find_one(result.id, tx);
	},

	update_quantity: async (id: number, quantity: number, tx?: MySql2Database) => {
		if (quantity < 0) throw new ServerError(error_messages.stock_insufficient, 400);

		const stock = await stock_repository.find_one(id, tx);
		if (!stock) throw new ServerError(error_messages.stock_not_found, 404);

		const result = await stock_repository.update_quantity(id, quantity, tx);
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		return { ...stock, quantity };
	},
};
