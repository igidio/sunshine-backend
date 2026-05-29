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
			items,
			total_items,
			is_last_page
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
		return await db.transaction(async (tx) => {
			const profile_result = await profile_repository.create({
				first_name: body.first_name,
				last_name: body.last_name,
				birth_date: body.birth_date,
				address: body.address || null
			}, tx);

			if (!profile_result[0] || !profile_result[0].id) {
				throw new ServerError(error_messages.customer_create_failed, 500);
			}

			const customer_result = await customer_repository.create({
				profile_id: profile_result[0].id
			}, tx);

			return customer_result[0];
		});
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
		// Note: we're only deleting the customer, not the associated profile. 
		// If profile delete is needed, profile_repository.delete(customer.profile_id)
		return { success: true };
	}
};
