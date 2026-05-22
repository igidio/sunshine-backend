import type { CreateProductDto, ReadProductDto } from "./product.dto"
import { product_repository } from "./product.repository"
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { product_image_insert } from "./product_image.schema";

export const product_service = {
	find_all: async (query: ReadProductDto) => {

		const count = await product_repository.count(query);
		const data = await product_repository.find_all(query);
		return {
			count,
			data,
			limit: query.limit,
			offset: query.offset,
			is_last_page: query.offset + query.limit >= count
		};

	},

	find_one: async (id: number) => {
		const product = await product_repository.find_one(id);
		if (!product) throw new ServerError(error_messages.product_not_found, 404);
		return product;
	},

	create: async (data: CreateProductDto) => {
		const result = await product_repository.create({
			category_id: data.category_id,
			name: data.name,
			description: data.description,
			price: data.price,
		});
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		await product_service.update_images(result.id, data.images);
		return await product_repository.find_one(result.id);
	},

	update: async (id: number, data: Partial<CreateProductDto>) => {
		const product = await product_repository.find_one(id);
		if (!product) throw new ServerError(error_messages.product_not_found, 404);
		console.log(data);

		const { images, ...product_data } = data;
		const has_product_data = Object.keys(product_data).length > 0;
		if (has_product_data) {
			const result = await product_repository.update(id, product_data);
			if (!result || result.affectedRows === 0) throw new ServerError(error_messages.nothing_to_update, 400);
		} else if (!images || images.length === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		await product_service.update_images(id, images);
		(data.images_to_remove) && await product_service.remove_images(data.images_to_remove);
		return await product_repository.find_one(id);
	},

	delete: async (id: number) => {
		return await product_repository.delete(id);
	},

	toggle_disable: async (id: number, disable: boolean) => {
		return await product_repository.toggle_disable(id, disable);
	},

	update_images: async (product_id: number, images: File[] | null | undefined) => {
		if (!images || images.length === 0) return null;

		const uploads: product_image_insert[] = [];

		for (const image of images) {
			const random_name = Math.random().toString(36).substring(2, 12);
			const extension = image.name.split('.').pop();
			const filename = `${Date.now()}-${random_name}.${extension}`;
			const route = `public/uploads/${filename}`;
			await Bun.write(route, image);
			uploads.push({
				product_id,
				image_url: filename,
			});
		}

		return await product_repository.create_images(uploads);
	},

	remove_images: async (ids: number[]) => {
		return await product_repository.remove_images(ids);
	}
}
