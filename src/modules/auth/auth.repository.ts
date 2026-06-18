import db from "~/database"
import { user_schema, type user_insert, type user_select } from "../user/user.schema"
import type { profile_insert } from "../profile/profile.schema"
import { user_repository } from "../user/user.repository"
import { profile_repository } from "../profile/profile.repository";
import type { Optional } from "~/helpers/custom_types";
import { and, eq } from "drizzle-orm";

export const auth_repository = {
	create_user: async (body: {
		user: Optional<user_insert, 'profile_id'>,
		profile: profile_insert
	}): Promise<user_select> => {
		return await db.transaction(async (tx) => {

			const profile = await profile_repository.create(body.profile, tx);
			if (!profile[0]) {
				throw new Error("Failed to create profile");
			}

			const user_body: user_insert = {
				...body.user,
				profile_id: profile[0].id,
			};

			await user_repository.create(user_body, tx);

			const new_user = await user_repository.find_one(
				{ email: body.user.email },
				tx,
				false
			);
			if (!new_user) {
				throw new Error("Failed to create user");
			}

			return new_user;
		});
	},
	// ...
};