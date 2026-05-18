import { user_repository } from "./user.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { permissions } from "~/data/permissions";

export const user_service = {
	get_all_users: async () => {
		return "Get all users"
	},
	get_user_by_id: async (id: string) => {
		const result = await user_repository.select_one(parseInt(id));
		if (!result) throw new ServerError(error_messages.user_not_found, 404);
		return result;
	},
	update_user_by_id: async (id: string, body: any) => {
		return `Update user with id ${id}`
	},
	delete_user_by_id: async (id: string) => {
		return `Delete user with id ${id}`
	},
	check_permissions: async (id: string, permission: typeof permissions[number]) => {
		const user = await user_repository.select_one(parseInt(id));
		if (!user) throw new ServerError(error_messages.user_not_found, 404);
		if (["superuser", "admin"].includes(user.role)) return true;
		if (user.role === "customer") {
			throw new ServerError(error_messages.user_forbidden, 403);
		}
		if (user.permissions === "" || user.permissions === null)
			throw new ServerError(error_messages.user_forbidden, 403);
		const permissions = JSON.parse(user.permissions);
		return permissions.includes(permission);
	}
}