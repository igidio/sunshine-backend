import db from "~/database"
import { notification_schema } from "./notification.schema"
import { eq } from "drizzle-orm"

export const notification_repository = {
	get: async (user_id: number, query: { limit: number; offset: number }) => {
		return await db.select().from(notification_schema).where(eq(notification_schema.user_id, user_id)).limit(query?.limit).offset(query?.offset);
	},
	delete: async (notification_id: number) => {
		return await db.update(notification_schema).set({ deleted_at: new Date() }).where(eq(notification_schema.id, notification_id)).execute();
	},
	mark_as_read: async (notification_id: number) => {
		return await db.update(notification_schema).set({ read_at: new Date() }).where(eq(notification_schema.id, notification_id)).execute();
	},
	mark_all_as_read: async (user_id: number) => {
		return await db.update(notification_schema).set({ read_at: new Date() }).where(eq(notification_schema.user_id, user_id)).execute();
	}
}