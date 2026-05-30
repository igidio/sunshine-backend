import { type UpdateProfileDto } from "./profile.dto";
import { profile_repository } from "./profile.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { MySql2Database } from "drizzle-orm/mysql2";

export const profile_service = {
	update_profile_by_id: async (id: number, body: UpdateProfileDto, tx?: MySql2Database) => {
		const has_updates = Object.keys(body).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);
		const result = await profile_repository.update(id, body, tx);
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}
		return result;
	},
};
