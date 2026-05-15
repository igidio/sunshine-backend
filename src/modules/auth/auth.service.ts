import type z from "zod";
import type { user_dto } from "../user/user.dto";
import type { profile_dto } from "../profile/profile.dto";
import { auth_repository } from "./auth.repository";
import jwt from "@elysia/jwt";
import { user_repository } from "../user/user.repository";
import { BcryptHelper } from "~/helpers/bcrypt";
import { error_messages } from "~/data/error_messages";
import { ServerError } from "~/classes/server_error";

type JwtDecorator = ReturnType<typeof jwt>["decorator"]["jwt"];

export const auth_service = {
	signup: async (
		body: {
			user: z.infer<typeof user_dto>,
			profile: z.infer<typeof profile_dto>
		}
	) => {
		return auth_repository.create_user(body);
	},

	sign_in: async (email_or_username: string, password: string) => {
		const user = await user_repository.select_one_by_username_or_email(email_or_username);
		if (!user) {
			throw new ServerError(error_messages.invalid_credentials, 400);
		}
		const is_match = await BcryptHelper.match_password(password, user.password);
		if (!is_match) {
			throw new ServerError(error_messages.invalid_password, 400);
		}
		return user;
	},

	verify: async (bearer: string, jwt: JwtDecorator) => {
		const is_valid = await jwt.verify(bearer);
		if (is_valid) {
			return { valid: true };
		} else {
			return { valid: false };
		}
	},

	get_authenticated_user: async (bearer: string, jwt: JwtDecorator) => {
		const payload = await jwt.verify(bearer);
		if (payload) {
			return { user: payload };
		} else {
			return { error: "Invalid token" };
		}
	},

	refresh: async (bearer: string, jwt_refresh: JwtDecorator, jwt: JwtDecorator) => {
		const payload = await jwt_refresh.verify(bearer);
		if (payload) {
			const { remember_me, ex, iat, ...rest } = payload as any;
			const new_token = await jwt.sign(rest);
			let refresh_token;
			if (remember_me) {
				refresh_token = await jwt_refresh.sign({...rest, remember_me: true });
			}
			return { access_token: new_token, refresh_token };
		} else {
			return { error: "Invalid refresh token" };
		}
	}
}