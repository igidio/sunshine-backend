import db from "~/database"
import { notification_schema } from "./notification.schema"
import { eq } from "drizzle-orm"

export const notification_repository = {
	get: async (user_id: number, query: { limit: number; offset: number }) => {
		return await db.select().from(notification_schema).where(eq(notification_schema.user_id, user_id)).limit(query?.limit).offset(query?.offset);
	}
}