import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { CreateSaleDto, ReadSaleDto, UpdateSaleDto } from "./sale.dto";
import { sale_repository } from "./sale.repository";
import { customer_service } from "../customer/customer.service";
import { product_service } from "../product/product.service";
import { appointment_service } from "../appointment/appointment.service";
import db from "~/database";
import type { sale_select } from "./sale.schema";

export const sale_service = {
	find: async (query: ReadSaleDto) => {
		const count = await sale_repository.count(query);
		const data = await sale_repository.find_all(query);

		return {
			count,
			data,
			limit: query.limit,
			offset: query.offset,
			is_last_page: query.offset + query.limit >= count,
		};
	},

	find_one: async (id: number) => {
		const sale = await sale_repository.find_one(id);
		if (!sale) throw new ServerError(error_messages.sale_not_found, 404);
		return sale;
	},

	create: async (data: CreateSaleDto) => {
		// Validate customer exists
		await customer_service.find_one(data.customer_id);

		let total = 0;
		const product_details: { product_id: number; quantity: number; unit_price: number }[] = [];
		const appointment_details: { appointment_id: number; price: number }[] = [];

		// Fetch products and sum their prices
		if (data.product_ids && data.product_ids.length > 0) {
			const products_result = await product_service.find_all({
				ids: data.product_ids,
				limit: 100,
				offset: 0,
			});
			const products = products_result.data;

			for (const product_id of data.product_ids) {
				const product = products.find((p: { id: number }) => p.id === product_id);
				if (!product) {
					throw new ServerError(`Producto con ID ${product_id} no encontrado`, 404);
				}
				const unit_price = Number(product.price);
				total += unit_price;
				product_details.push({ product_id, quantity: 1, unit_price });
			}
		}

		// Fetch appointments and sum their treatment prices
		if (data.appointment_ids && data.appointment_ids.length > 0) {
			for (const appointment_id of data.appointment_ids) {
				const appointment = await appointment_service.find_one(appointment_id);
				const treatment = appointment.treatment as { price: number } | null;
				if (!treatment) {
					throw new ServerError(`La cita ${appointment_id} no tiene un tratamiento asociado`, 400);
				}
				const price = Number(treatment.price);
				total += price;
				appointment_details.push({ appointment_id, price });
			}
		}

		// Create sale within a transaction
		const result = await db.transaction(async (tx) => {
			const sale = await sale_repository.create(
				{
					customer_id: data.customer_id,
					total,
					payment_method: data.payment_method,
				},
				tx,
			);

			if (!sale) throw new ServerError(error_messages.sale_create_failed, 500);

			if (product_details.length > 0) {
				await sale_repository.create_product_details(
					product_details.map((pd) => ({ ...pd, sale_id: sale.id })),
					tx,
				);
			}

			if (appointment_details.length > 0) {
				await sale_repository.create_appointment_details(
					appointment_details.map((ad) => ({ ...ad, sale_id: sale.id })),
					tx,
				);
			}

			const created_sale = await sale_repository.find_one(sale.id, tx);
			if (!created_sale) throw new ServerError(error_messages.sale_create_failed, 500);
			return created_sale;
		});

		return result;
	},

	update: async (id: number, data: UpdateSaleDto) => {
		const current_sale = await sale_repository.find_one(id);
		if (!current_sale) throw new ServerError(error_messages.sale_not_found, 404);

		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		return await db.transaction(async (tx) => {
			let total = 0;

			// Handle product replacement
			if (data.product_ids !== undefined) {
				await sale_repository.delete_product_details(id, tx);

				if (data.product_ids.length > 0) {
					const products_result = await product_service.find_all({
						ids: data.product_ids,
						limit: 100,
						offset: 0,
					});
					const products = products_result.data;

					const product_details = data.product_ids.map((product_id) => {
						const product = products.find((p: { id: number }) => p.id === product_id);
						if (!product) {
							throw new ServerError(`Producto con ID ${product_id} no encontrado`, 404);
						}
						const unit_price = Number(product.price);
						total += unit_price;
						return { product_id, quantity: 1, unit_price, sale_id: id };
					});

					await sale_repository.create_product_details(product_details, tx);
				}
			} else if (current_sale.product_details) {
				for (const pd of current_sale.product_details) {
					total += Number(pd.unit_price);
				}
			}

			// Handle appointment replacement
			if (data.appointment_ids !== undefined) {
				await sale_repository.delete_appointment_details(id, tx);

				if (data.appointment_ids.length > 0) {
					const appointment_details: { appointment_id: number; price: number; sale_id: number }[] = [];

					for (const appointment_id of data.appointment_ids) {
						const appointment = await appointment_service.find_one(appointment_id);
						const treatment = appointment.treatment as { price: number } | null;
						if (!treatment) {
							throw new ServerError(`La cita ${appointment_id} no tiene un tratamiento asociado`, 400);
						}
						const price = Number(treatment.price);
						total += price;
						appointment_details.push({ appointment_id, price, sale_id: id });
					}

					await sale_repository.create_appointment_details(appointment_details, tx);
				}
			} else if (current_sale.treatment_details) {
				for (const td of current_sale.treatment_details) {
					total += Number(td.price);
				}
			}

			// Update sale record
			const update_data: Partial<sale_select> = { total };
			if (data.payment_method !== undefined) {
				update_data.payment_method = data.payment_method;
			}

			const update_result = await sale_repository.update(id, update_data, tx);
			if (!update_result || update_result.affectedRows === 0) {
				throw new ServerError(error_messages.nothing_to_update, 400);
			}

			const updated = await sale_repository.find_one(id, tx);
			if (!updated) throw new ServerError(error_messages.sale_not_found, 404);
			return updated;
		});
	},
};
