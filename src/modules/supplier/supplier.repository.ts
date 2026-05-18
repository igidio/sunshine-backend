import db from "~/database"
import { supplier_schema, type supplier_insert } from "./supplier.schema";
import { isNull } from "drizzle-orm";

export const supplier_repository = {
	get: async ()  => {
		return db.select().from(supplier_schema).where(isNull(supplier_schema.deleted_at));
	},
	create: async (data: supplier_insert) => {
		const [result] = await db.insert(supplier_schema).values(data).$returningId();
		return result;
	}
}