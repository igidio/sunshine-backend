import { create } from "domain";
import { supplier_repository } from "./supplier.repository";
import type { PaginationType } from "~/helpers/types";
import type { CreateSupplierDto, ReadSupplierDto } from "./supplier.dto";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";



export const supplier_service = {
	get: async (params: ReadSupplierDto) => {

		const count = await supplier_repository.count(params);
		const data = await supplier_repository.find_all(params);

		return {
			count,
			data,
			limit: params.limit,
			offset: params.offset,
			is_last_page: params.offset + params.limit >= count
		};
	},

	get_one: async (id: number) => {
		const result = await supplier_repository.find_one(id);
		if (!result) throw new ServerError(error_messages.supplier_not_found, 404);
		return result;
	},

	create: async (data: CreateSupplierDto) => {
		const result = await supplier_repository.create({
			address: data.address,
			email: data.email,
			name: data.name,
			phone_number: data.phone_number,
			description: data.description,
			image_url: data.image_url
		});
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		const supplier = await supplier_repository.find_one(result.id);
		return supplier;
	},

	update: async (id: number, data: Partial<CreateSupplierDto>) => {
		await Bun.sleep(2000);
		const supplier = await supplier_repository.find_one(id);
		if (!supplier) throw new ServerError(error_messages.supplier_not_found, 404);

		const result = await supplier_repository.update(id, data);
		if (!result || result.affectedRows === 0) throw new ServerError(error_messages.nothing_to_update, 400);

		return { ...supplier, ...data };
	},

	delete: async (id: number) => {
		return await supplier_repository.delete(id);
	},

	toggle_disable: async (id: number, disable: boolean) => {
		return await supplier_repository.toggle_disable(id, disable);
	},
}