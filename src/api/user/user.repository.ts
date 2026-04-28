import db from "~/database"
import { user_schema, type user_insert } from "./user.schema"


export const user_repository = {
	create: async (body: user_insert) => {
		return await db.insert(user_schema).values(body);
	}
}