import db from "~/database"
import { table_product } from "~/database/schema"

export const product_repository = {
	find_all: async () => {
		return await db.select().from(table_product)
	}
}