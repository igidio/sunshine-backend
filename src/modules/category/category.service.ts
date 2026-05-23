import type { CreateCategoryDto, ReadCategoryDto } from "./category.dto";
import { category_repository } from "./category.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";

export const category_service = {
	get: async (params: ReadCategoryDto) => {
		const count = await category_repository.count(params);
		const data = await category_repository.find_all(params);

		return {
			count,
			data,
			limit: params.limit,
			offset: params.offset,
			is_last_page: params.offset + params.limit >= count
		};
	},

	get_one: async (id: number) => {
		const result = await category_repository.find_one(id);
		if (!result) throw new ServerError(error_messages.category_not_found, 404);
		return result;
	},

	create: async (data: CreateCategoryDto) => {
		const result = await category_repository.create({
			name: data.name,
			description: data.description,
		});
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		return await category_repository.find_one(result.id);
	},

	update: async (id: number, data: Partial<CreateCategoryDto>) => {
		const category = await category_repository.find_one(id);
		if (!category) throw new ServerError(error_messages.category_not_found, 404);

		const result = await category_repository.update(id, data);
		if (!result || result.affectedRows === 0) throw new ServerError(error_messages.nothing_to_update, 400);

		return { ...category, ...data };
	},

	delete: async (id: number) => {
		return await category_repository.delete(id);
	}
};