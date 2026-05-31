import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { CreateTreatmentDto, ReadTreatmentDto, ToggleDisabledTreatmentDto, UpdateTreatmentDto } from "./treatment.dto";
import { treatment_repository } from "./treatment.repository";

export const treatment_service = {
	find: async (pagination: ReadTreatmentDto) => {
		const count = await treatment_repository.count(pagination);
		const data = await treatment_repository.find_all(pagination);

		return {
			count,
			data,
			limit: pagination.limit,
			offset: pagination.offset,
			is_last_page: pagination.offset + pagination.limit >= count,
		};
	},

	find_one: async (id: number) => {
		const treatment = await treatment_repository.find_one(id);
		if (!treatment) throw new ServerError(error_messages.treatment_not_found, 404);
		return treatment;
	},

	create: async (data: CreateTreatmentDto) => {
		const result = await treatment_repository.create(data);
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		return await treatment_service.find_one(result.id);
	},

	update: async (id: number, data: UpdateTreatmentDto) => {
		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		const current_treatment = await treatment_repository.find_one(id);
		if (!current_treatment) throw new ServerError(error_messages.treatment_not_found, 404);

		const result = await treatment_repository.update(id, data);
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		return await treatment_service.find_one(id);
	},

	delete: async (id: number) => {
		const current_treatment = await treatment_repository.find_one(id);
		if (!current_treatment) throw new ServerError(error_messages.treatment_not_found, 404);

		await treatment_repository.delete(id);
		return { success: true };
	},

	toggle_disabled: async (id: number, data?: ToggleDisabledTreatmentDto) => {
		const current_treatment = await treatment_repository.find_one(id);
		if (!current_treatment) throw new ServerError(error_messages.treatment_not_found, 404);

		const target_disabled_at = typeof data?.disabled === "boolean"
			? (data.disabled ? new Date() : null)
			: (current_treatment.disabled_at ? null : new Date());

		await treatment_repository.toggle_disabled(id, target_disabled_at);
		return await treatment_service.find_one(id);
	},
};