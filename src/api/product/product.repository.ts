import db from "~/database"
import { product_schema } from "./product.schema"

export const product_repository = {
	find_all: async () => {
		return await db.select().from(product_schema)
	}
}