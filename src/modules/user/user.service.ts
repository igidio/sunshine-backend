import type z from "zod"

export const user_service = {
	get_all_users: async () => {
		return "Get all users"
	},
	get_user_by_id: async (id: string) => {
		return `Get user with id ${id}`
	},
	update_user_by_id: async (id: string, body: any) => {
		return `Update user with id ${id}`
	},
	delete_user_by_id: async (id: string) => {
		return `Delete user with id ${id}`
	}
}