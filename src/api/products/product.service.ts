export const product_service = {
	get_all_products: async () => {
		return "Get all products"
	},
	create_product: async (body: any) => {
		return "Create a new product"
	},
	get_product_by_id: async (id: string) => {
		return `Get product with id ${id}`
	},
	update_product_by_id: async (id: string, body: any) => {
		return `Update product with id ${id}`
	},
	delete_product_by_id: async (id: string) => {
		return `Delete product with id ${id}`
	}
}
