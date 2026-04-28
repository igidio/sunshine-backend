import db from "~/database"
import type { user_insert } from "../user/user.schema"
import type { profile_insert } from "../profile/profle.schema"
import { user_repository } from "../user/user.repository"
import { profile_repository } from "../profile/profile.repository";
import type { Optional } from "~/helpers/custom_types";

export const auth_repository = {
	create_user: async (body: {
		user: user_insert,
		profile: Optional<profile_insert, 'user_id'>
	}) => {
		return await db.transaction(async (tx) => {

			const user = await user_repository.create(body.user, tx);
			console.log("user");
			
			if (!user[0] || !user[0].id) {
				throw new Error("Failed to create user");
			}

			const profile_body: profile_insert = {
				...body.profile,
				user_id: user[0].id,
			}

			const profile = await profile_repository.create(profile_body, tx);
			return { user, profile };
		});
	}
}