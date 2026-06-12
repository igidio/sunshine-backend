import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { CreateSaleDto, ReadSaleDto, UpdateSaleDto } from "./sale.dto";
import { sale_repository } from "./sale.repository";
import { customer_service } from "../customer/customer.service";
import { product_service } from "../product/product.service";
import { appointment_service } from "../appointment/appointment.service";
import db from "~/database";
import type { sale_select } from "./sale.schema";
import { bill_service } from "../bill/bill.service";
import { stock_service } from "../stock/stock.service";

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
		await customer_service.find_one(data.customer_id);

		let total = 0;
		const product_details: { product_id: number; quantity: number; unit_price: number }[] = [];
		const appointment_details: { appointment_id: number; price: number }[] = [];

		if (data.products && data.products.length > 0) {
			const product_ids = data.products.map((p) => p.id);
			const products_result = await product_service.find_all({
				ids: product_ids,
				limit: 100,
				offset: 0,
			});
			const products = products_result.data;

			for (const { id: product_id, quantity } of data.products) {
				const product = products.find((p: { id: number }) => p.id === product_id);
				if (!product) {
					throw new ServerError(`Producto con ID ${product_id} no encontrado`, 404);
				}
				const unit_price = Number(product.price);
				total += unit_price * quantity;
				product_details.push({ product_id, quantity, unit_price });
			}
		}

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

				for (const pd of product_details) {
					const stock = await stock_service.get_by_product(pd.product_id, tx);
					if (!stock) {
						throw new ServerError(
							`No hay stock registrado para el producto ${pd.product_id}`,
							400,
						);
					}
					const new_quantity = stock.quantity - pd.quantity;
					await stock_service.update_quantity(stock.id, new_quantity, tx);
				}
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

		const { bill } = await bill_service.generate(result);
		await sale_service.update_bill(result.id, bill);

		return { ...result, bill };
	},

	update: async (id: number, data: UpdateSaleDto) => {
		const current_sale = await sale_repository.find_one(id);
		if (!current_sale) throw new ServerError(error_messages.sale_not_found, 404);

		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		return await db.transaction(async (tx) => {
			let total = 0;

			if (data.products !== undefined) {
				if (current_sale.product_details && current_sale.product_details.length > 0) {
					for (const old_pd of current_sale.product_details) {
						const stock = await stock_service.get_by_product(old_pd.product_id, tx);
						if (stock) {
							const restored_quantity = stock.quantity + old_pd.quantity;
							await stock_service.update_quantity(stock.id, restored_quantity, tx);
						}
					}
				}

				await sale_repository.delete_product_details(id, tx);

				if (data.products.length > 0) {
					const product_ids = data.products.map((p) => p.id);
					const products_result = await product_service.find_all({
						ids: product_ids,
						limit: 100,
						offset: 0,
					});
					const products = products_result.data;

					const product_details = data.products.map(({ id: product_id, quantity }) => {
						const product = products.find((p: { id: number }) => p.id === product_id);
						if (!product) {
							throw new ServerError(`Producto con ID ${product_id} no encontrado`, 404);
						}
						const unit_price = Number(product.price);
						total += unit_price * quantity;
						return { product_id, quantity, unit_price, sale_id: id };
					});

					await sale_repository.create_product_details(product_details, tx);

					for (const pd of product_details) {
						const stock = await stock_service.get_by_product(pd.product_id, tx);
						if (!stock) {
							throw new ServerError(
								`No hay stock registrado para el producto ${pd.product_id}`,
								400,
							);
						}
						const new_quantity = stock.quantity - pd.quantity;
						await stock_service.update_quantity(stock.id, new_quantity, tx);
					}
				}
			} else if (current_sale.product_details) {
				for (const pd of current_sale.product_details) {
					total += Number(pd.unit_price);
				}
			}

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
			} else if (current_sale.appointment_details) {
				for (const td of current_sale.appointment_details) {
					total += Number(td.price);
				}
			}

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

	update_bill: async (id: number, bill_filename: string) => {
		return await sale_repository.update(id, { bill: bill_filename });
	}
};
