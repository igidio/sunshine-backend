import { create } from "domain";
import { supplier_repository } from "./supplier.repository";
import type { PaginationType } from "~/helpers/types";
import type { CreateSupplierDto, ReadSupplierDto, UpdateSupplierDto } from "./supplier.dto";
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
		const result = await supplier_repository.create(data);
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		return await supplier_repository.find_one(result.id);
	},

	update: async (id: number, data: UpdateSupplierDto) => {
		const result = await supplier_repository.update(id, data);
		if (!result || result.affectedRows === 0) throw new ServerError(error_messages.nothing_to_update, 400);

		const updated_supplier = await supplier_repository.find_one(id);

		return updated_supplier;
	},

	delete: async (id: number) => {
		return await supplier_repository.delete(id);
	},

	toggle_disable: async (id: number, disable: boolean) => {
		return await supplier_repository.toggle_disable(id, disable);
	},

	update_image: async (image: File | null | undefined) => {
		let image_url: string | null | undefined = undefined;
		const random_name = Math.random().toString(36).substring(2, 12);
		if (image) {
			const filename = `${Date.now()}-${random_name}.${image.name.split('.').pop()}`;
			const route = `public/uploads/${filename}`;
			await Bun.write(route, image);
			image_url = filename;
		} else {
			image_url = null;
		}
		return image_url;
	}
}