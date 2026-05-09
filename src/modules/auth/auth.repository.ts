import db from "~/database"
import { user_schema, type user_insert } from "../user/user.schema"
import type { profile_insert } from "../profile/profile.schema"
import { user_repository } from "../user/user.repository"
import { profile_repository } from "../profile/profile.repository";
import type { Optional } from "~/helpers/custom_types";
import { and, eq } from "drizzle-orm";

export const auth_repository = {
	create_user: async (body: {
		user: Optional<user_insert, 'profile_id'>,
		profile: profile_insert
	}) => {
		return await db.transaction(async (tx) => {

			const profile = await profile_repository.create(body.profile, tx);
			if (!profile[0] || !profile[0]) {
				throw new Error("Failed to create profile");
			}

			const user_body: user_insert = {
				...body.user,
				profile_id: profile[0].id,
			};

			const user = await user_repository.create(user_body, tx);
			return { user, profile };

		});
	},
	sign_in: async (email: string, password: string) => {
		return await db.select()
			.from(user_schema)
			.where(and( eq(user_schema.email, email), eq(user_schema.password, password)))
	}
}