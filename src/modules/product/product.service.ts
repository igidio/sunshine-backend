import type { ReadProductDto } from "./product.dto"
import { product_repository } from "./product.repository"

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
		return product_repository.find_one(id)
	},

	create_product: async (body: any) => {
		return "Create a new product"
	},
	update_product_by_id: async (id: string, body: any) => {
		return `Update product with id ${id}`
	},
	delete_product_by_id: async (id: string) => {
		return `Delete product with id ${id}`
	}
}
