import db from "~/database"
import { supplier_schema } from "./supplier.schema";
import { isNull } from "drizzle-orm";

export const supplier_repository = {
	get: async ()  => {
		return db.select().from(supplier_schema).where(isNull(supplier_schema.deleted_at));
	}
}