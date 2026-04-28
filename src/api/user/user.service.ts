const user_service = {
	get_all_users: async () => {
		return "Get all users"
	},
	create_user: async (body: {
		username: string,
		password: string,
		email: string,
		role?: "superuser" | "admin" | "employer"
	}) => {
		return "Create a new user"
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