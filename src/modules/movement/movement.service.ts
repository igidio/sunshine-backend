import db from "~/database";
import { movement_repository } from "./movement.repository";
import type { CreateMovementDto, ReadMovementDto } from "./movement.dto";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import { stock_repository } from "../stock/stock.repository";

const ensure_stock_quantity = (quantity: number) => {
	if (quantity < 0) throw new ServerError(error_messages.stock_insufficient, 400);
};

export const movement_service = {
	get: async (params: ReadMovementDto) => {
		const count = await movement_repository.count(params);
		const data = await movement_repository.find_all(params);

		return {
			count,
			data,
			limit: params.limit,
			offset: params.offset,
			is_last_page: params.offset + params.limit >= count,
		};
	},

	get_one: async (id: number) => {
		const result = await movement_repository.find_one(id);
		if (!result) throw new ServerError(error_messages.movement_not_found, 404);
		return result;
	},

	create: async (data: CreateMovementDto) => {
		const result = await db.transaction(async (tx) => {
			const stock = await stock_repository.find_one(data.stock_id, tx);
			if (!stock) throw new ServerError(error_messages.stock_not_found, 404);

			const next_quantity = stock.quantity + data.quantity;
			ensure_stock_quantity(next_quantity);

			const result = await movement_repository.create({
				stock_id: data.stock_id,
				supplier_id: data.supplier_id ?? null,
				type: data.type,
				quantity: data.quantity,
				notes: data.notes,
			}, tx);
			if (!result) throw new ServerError(error_messages.create_failed, 500);
			await stock_repository.update_quantity(stock.id, next_quantity, tx);
			return result;
		});

		return await movement_service.get_one(result.id);
	},

	update: async (id: number, data: Partial<CreateMovementDto>) => {
		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		return await db.transaction(async (tx) => {
			const movement = await movement_repository.find_one(id, tx);
			if (!movement) throw new ServerError(error_messages.movement_not_found, 404);

			const next_stock_id = data.stock_id ?? movement.stock_id;
			const next_quantity = data.quantity ?? movement.quantity;

			if (data.stock_id !== undefined || data.quantity !== undefined) {
				const current_stock = await stock_repository.find_one(movement.stock_id, tx);
				if (!current_stock) throw new ServerError(error_messages.stock_not_found, 404);

				const reverted_quantity = current_stock.quantity - movement.quantity;
				ensure_stock_quantity(reverted_quantity);

				if (movement.stock_id !== next_stock_id) {
					const next_stock = await stock_repository.find_one(next_stock_id, tx);
					if (!next_stock) throw new ServerError(error_messages.stock_not_found, 404);

					const next_stock_quantity = next_stock.quantity + next_quantity;
					ensure_stock_quantity(next_stock_quantity);

					await stock_repository.update_quantity(current_stock.id, reverted_quantity, tx);
					await stock_repository.update_quantity(next_stock.id, next_stock_quantity, tx);
				} else {
					const updated_quantity = reverted_quantity + next_quantity;
					ensure_stock_quantity(updated_quantity);
					await stock_repository.update_quantity(current_stock.id, updated_quantity, tx);
				}
			}

			const result = await movement_repository.update(id, {
				stock_id: data.stock_id,
				supplier_id: data.supplier_id,
				type: data.type,
				quantity: data.quantity,
				notes: data.notes,
			}, tx);

			if (!result || result.affectedRows === 0) {
				throw new ServerError(error_messages.nothing_to_update, 400);
			}

			return await movement_repository.find_one(id, tx);
		});
	},

	delete: async (id: number) => {
		return await db.transaction(async (tx) => {
			const movement = await movement_repository.find_one(id, tx);
			if (!movement) throw new ServerError(error_messages.movement_not_found, 404);

			const stock = await stock_repository.find_one(movement.stock_id, tx);
			if (!stock) throw new ServerError(error_messages.stock_not_found, 404);

			const next_quantity = stock.quantity - movement.quantity;
			ensure_stock_quantity(next_quantity);

			await stock_repository.update_quantity(stock.id, next_quantity, tx);
			await movement_repository.delete(id, tx);

			return { success: true };
		});
	},
};
