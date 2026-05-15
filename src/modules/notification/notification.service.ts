import { notification_repository } from "./notification.repository";

export const notification_service = {
	get: async (user_id: number) => {
		return await notification_repository.get(user_id);
	}
}