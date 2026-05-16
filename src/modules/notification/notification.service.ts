import { notification_repository } from "./notification.repository";

export const notification_service = {
	get: async (user_id: number, query: { limit: number; offset: number }) => {
		return await notification_repository.get(user_id, query);
	},
	delete: async (notification_id: number) => {
		return await notification_repository.delete(notification_id);
	},
	mark_as_read: async (notification_id: number) => {
		return await notification_repository.mark_as_read(notification_id);
	},
	mark_all_as_read: async (user_id: number) => {
		return await notification_repository.mark_all_as_read(user_id);
	}
}