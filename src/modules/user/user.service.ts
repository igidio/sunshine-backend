import type z from "zod"
import { user_repository } from "./user.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";

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
	}
}