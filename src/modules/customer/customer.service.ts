import { customer_repository } from "./customer.repository";
import type { CreateCustomerDto, ReadCustomerDto, UpdateCustomerDto } from "./customer.dto";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import db from "~/database";
import { profile_repository } from "../profile/profile.repository";
import { profile_service } from "../profile/profile.service";

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

	update: async (id: number, body: UpdateCustomerDto) => {
		const current_customer = await customer_repository.find_one(id);
		if (!current_customer) {
			throw new ServerError(error_messages.customer_not_found, 404);
		}

		const { phone_number, ...profile_data } = body;
		const has_customer_updates = phone_number !== undefined;
		const has_profile_updates = Object.keys(profile_data).length > 0;

		if (!has_customer_updates && !has_profile_updates) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		const customer_profile = current_customer.profile;
		if (!customer_profile) {
			throw new ServerError(error_messages.customer_create_failed, 500);
		}

		const updated_customer = await db.transaction(async (tx) => {
			if (has_profile_updates) {
				await profile_service.update_profile_by_id(customer_profile.id, profile_data, tx);
			}

			if (has_customer_updates) {
				await customer_repository.update(id, { phone_number }, tx);
			}

			const result = await customer_repository.find_one(id, tx);
			if (!result) {
				throw new ServerError(error_messages.customer_not_found, 404);
			}

			return result;
		});

		return updated_customer;
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

	toggle_disabled: async (id: number, disabled?: boolean) => {
		const customer = await customer_repository.find_one(id);
		if (!customer) {
			throw new ServerError(error_messages.customer_not_found, 404);
		}

		await customer_repository.toggle_disable(id, disabled);
		return await customer_repository.find_one(id);
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
