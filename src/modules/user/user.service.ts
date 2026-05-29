import { user_repository } from "./user.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { permissions } from "~/data/permissions";
import { BcryptHelper } from "~/helpers/bcrypt";
import type { ReadUserDto, UpdateUserDtoSchema, ToggleDisabledUserDtoSchema, SetPermissionsUserDtoSchema } from "./user.dto";
import type z from "zod";

export const user_service = {
	find: async (params: ReadUserDto) => {
		const count = await user_repository.count(params);
		const data = await user_repository.find_all(params);

		return {
			count,
			data,
			limit: params.limit,
			offset: params.offset,
			is_last_page: params.offset + params.limit >= count,
		};
	},
	find_one: async (id: number) => {
		const result = await user_repository.find_one({id});
		if (!result) throw new ServerError(error_messages.user_not_found, 404);
		return result;
	},
	update: async (id: number, data: z.infer<typeof UpdateUserDtoSchema>) => {
		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);
		
		const current_user = await user_repository.find_one({id});
		if (!current_user) throw new ServerError(error_messages.user_not_found, 404);
		
		const update_data = { ...data };
		if (update_data.password) {
			update_data.password = await BcryptHelper.hash_password(update_data.password);
		}

		const result = await user_repository.update(id, update_data);
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		return await user_service.find_one(id);
	},
	toggle_disabled: async (id: number, data: z.infer<typeof ToggleDisabledUserDtoSchema>) => {
		const current_user = await user_repository.find_one({id});
		if (!current_user) throw new ServerError(error_messages.user_not_found, 404);

		let target_disabled_at: Date | null = null;
		if (data.disabled !== undefined) {
			target_disabled_at = data.disabled ? new Date() : null;
		} else {
			target_disabled_at = current_user.disabled_at ? null : new Date();
		}

		await user_repository.toggle_disabled(id, target_disabled_at);
		return await user_service.find_one(id);
	},
	set_permissions: async (id: number, data: z.infer<typeof SetPermissionsUserDtoSchema>) => {
		const current_user = await user_repository.find_one({id});
		if (!current_user) throw new ServerError(error_messages.user_not_found, 404);

		const permissions_string = JSON.stringify(data.permissions);
		await user_repository.set_permissions(id, permissions_string);
		return await user_service.find_one(id);
	},
	check_permissions: async (id: number, permission: typeof permissions[number]) => {
		const user = await user_repository.find_one({id});
		if (!user) throw new ServerError(error_messages.user_not_found, 404);
		if (["superuser", "admin"].includes(user.role)) return true;
		if (user.role === "customer") {
			throw new ServerError(error_messages.user_forbidden, 403);
		}
		if (user.permissions === "" || user.permissions === null)
			throw new ServerError(error_messages.user_forbidden, 403);
		const parsed_permissions = JSON.parse(user.permissions);
		return parsed_permissions.includes(permission);
	}
}