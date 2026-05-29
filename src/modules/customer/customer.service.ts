import { customer_repository } from "./customer.repository";
import type { CreateCustomerDto, ReadCustomerDto } from "./customer.dto";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import db from "~/database";
import { profile_repository } from "../profile/profile.repository";

export const customer_service = {
	find: async (pagination: ReadCustomerDto) => {
		const total_items = await customer_repository.count(pagination);
		const items = await customer_repository.find_all(pagination);

		const is_last_page = pagination.offset + pagination.limit >= total_items;

		return {
			data: items,
			count: total_items,
			is_last_page,
			limit: pagination.limit,
			offset: pagination.offset,
		};
	},

	find_one: async (id: number) => {
		const customer = await customer_repository.find_one(id);
		if (!customer) {
			throw new ServerError(error_messages.customer_not_found, 404);
		}
		return customer;
	},

	create: async (body: CreateCustomerDto) => {
		const customer = await db.transaction(async (tx) => {
			const profile_result = await profile_repository.create(body, tx);

			if (!profile_result[0] || !profile_result[0].id) {
				throw new ServerError(error_messages.customer_create_failed, 500);
			}

			const customer_result = await customer_repository.create({
				profile_id: profile_result[0].id
			}, tx);

			return customer_result[0];
		});
		if (!customer || !customer.id) {
			throw new ServerError(error_messages.customer_create_failed, 500);
		}

		return await customer_repository.find_one(customer?.id);
	},

	toggle_disabled: async (id: number) => {
		const customer = await customer_repository.find_one(id);
		if (!customer) {
			throw new ServerError(error_messages.customer_not_found, 404);
		}

		await customer_repository.toggle_disable(id);
		return { success: true };
	},

	delete: async (id: number) => {
		const customer = await customer_repository.find_one(id);
		if (!customer) {
			throw new ServerError(error_messages.customer_not_found, 404);
		}

		await customer_repository.delete(id);
		return { success: true };
	}
};
