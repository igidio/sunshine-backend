import { user_repository } from "./user.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { permissions } from "~/data/permissions";
import { Hasher } from "~/helpers/hasher";
import type { ReadUserDto, UpdateUserDto, ToggleDisabledUserDto, SetPermissionsUserDto, UpdateUserPasswordDto } from "./user.dto";
import type { user_select, UserRole } from "./user.schema";

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
		const result = await user_repository.find_one({ id }) as user_select | null;
		if (!result) throw new ServerError(error_messages.user_not_found, 404);
		return result;
	},
	find_by_email: async (email: string) => {
		return await user_repository.find_one({ email }) as user_select | null;
	},
	verify_email: async (id: number) => {
		await user_repository.update(id, { email_verified_at: new Date() });
	},
	reset_password: async (id: number, new_password: string) => {
		const new_hashed_password = await Hasher.hash_password(new_password);
		const result = await user_repository.update(id, { password: new_hashed_password });
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}
		return await user_service.find_one(id);
	},
	update: async (id: number, data: UpdateUserDto) => {
		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		const current_user = await user_repository.find_one({ id });
		if (!current_user) throw new ServerError(error_messages.user_not_found, 404);

		const update_data = { ...data };

		const result = await user_repository.update(id, update_data);
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		return await user_service.find_one(id);
	},

	update_password: async (id: number, data: UpdateUserPasswordDto) => {
		const current_user = await user_repository.find_one({ id }, undefined, false);
		if (!current_user) throw new ServerError(error_messages.user_not_found, 404);

		const is_match = await Hasher.match_password(data.current_password, current_user.password);
		if (!is_match) {
			throw new ServerError(error_messages.invalid_current_password, 400);
		}

		const new_hashed_password = await Hasher.hash_password(data.new_password);
		const result = await user_repository.update(id, { password: new_hashed_password });
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		return await user_service.find_one(id);
	},

	toggle_disabled: async (id: number, data: ToggleDisabledUserDto) => {
		const current_user = await user_repository.find_one({ id });
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
	set_permissions: async (id: number, data: SetPermissionsUserDto) => {
		const current_user = await user_repository.find_one({ id });
		if (!current_user) throw new ServerError(error_messages.user_not_found, 404);

		const permissions_string = JSON.stringify(data.permissions);
		await user_repository.set_permissions(id, permissions_string);
		return await user_service.find_one(id);
	},
	check_permissions: async (id: number, permission: typeof permissions[number]) => {
		const user = await user_repository.find_one({ id });
		if (!user) throw new ServerError(error_messages.user_not_found, 404);
		if (["superuser", "admin"].includes(user.role)) return true;
		if (user.role === "customer") {
			throw new ServerError(error_messages.user_forbidden, 403);
		}
		if (user.permissions === "" || user.permissions === null)
			throw new ServerError(error_messages.user_forbidden, 403);
		const parsed_permissions = JSON.parse(user.permissions);
		return parsed_permissions.includes(permission);
	},
	check_authenticated_user: async (
		{ is_verified, is_disabled, has_telegram_id, has_chat_access, allowed_roles, user, user_id }: {
			is_verified?: boolean;
			is_disabled?: boolean;
			has_telegram_id?: boolean;
			has_chat_access?: boolean;
			allowed_roles?: UserRole[];
			user?: Partial<user_select>;
			user_id?: number;
		}
	) => {
		const target = user ?? (user_id ? await user_service.find_one(user_id) : null);
		if (!target) throw new ServerError(error_messages.user_not_found, 404);

		if (is_verified && !target.email_verified_at) {
			throw new ServerError(error_messages.email_not_verified, 403);
		}
		if (is_disabled && target.disabled_at) {
			throw new ServerError(error_messages.user_disabled, 403);
		}
		if (has_telegram_id && !target.telegram_id) {
			throw new ServerError(error_messages.telegram_not_linked, 400);
		}
		if (has_chat_access && !target.chat_access) {
			throw new ServerError(error_messages.user_chat_access_required, 400);
		}
		if (allowed_roles && allowed_roles.length > 0 && !allowed_roles.includes(target.role as UserRole)) {
			throw new ServerError(error_messages.user_forbidden, 403);
		}
		return target;
	},
	find_by_chat_access: async (unhashed_key: string) => {
		const hashed = Hasher.hash_token(unhashed_key);
		return await user_repository.find_one({ chat_access: hashed }, undefined, false);
	},
	find_by_telegram_id: async (telegram_id: string) => {
		return await user_repository.find_one({ telegram_id }, undefined, false);
	},
	link_telegram: async (chat_access_key: string, telegram_id: string) => {
		const user = await user_service.find_by_chat_access(chat_access_key);
		if (!user) throw new ServerError(error_messages.invalid_chat_access, 400);

		const existing = await user_service.find_by_telegram_id(telegram_id);
		if (existing && existing.id !== user.id) {
			throw new ServerError(error_messages.telegram_id_already_linked, 400);
		}

		await user_repository.update(user.id, { telegram_id });
		return await user_service.find_one(user.id);
	},
	unlink_telegram: async (telegram_id: string) => {
		const user = await user_service.find_by_telegram_id(telegram_id);
		if (!user) throw new ServerError(error_messages.telegram_not_linked, 400);

		await user_repository.update(user.id, { telegram_id: null });
		return await user_service.find_one(user.id);
	}
}