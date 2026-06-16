import type { CreateUserDto } from "../user/user.dto";
import type { CreateProfileDto } from "../profile/profile.dto";
import { auth_repository } from "./auth.repository";
import jwt from "@elysia/jwt";
import { user_repository } from "../user/user.repository";
import { Hasher } from "~/helpers/hasher";
import { error_messages } from "~/data/error_messages";
import { ServerError } from "~/classes/server_error";
import type { user_select, UserRole } from "../user/user.schema";

type JwtDecorator = ReturnType<typeof jwt>["decorator"]["jwt"];

export const auth_service = {
	sign_up: async (
		body: {
			user: CreateUserDto,
			profile: CreateProfileDto
		},
		role: UserRole = "customer"
	) => {
		const existing_email = await user_repository.find_one({ email: body.user.email }, undefined, false);
		if (existing_email) throw new ServerError(error_messages.email_in_use, 409);

		const existing_username = await user_repository.find_one({ username: body.user.username }, undefined, false);
		if (existing_username) throw new ServerError(error_messages.username_in_use, 409);

		const password = await Hasher.hash_password(body.user.password);
		return auth_repository.create_user({ ...body, user: { ...body.user, password, role } }) as unknown as user_select;
	},

	sign_in: async (email_or_username: string, password: string) => {
		const user = await user_repository.find_one({ email: email_or_username, username: email_or_username }, undefined, false);
		if (!user) {
			throw new ServerError(error_messages.invalid_credentials, 400);
		}
		const is_match = await Hasher.match_password(password, user.password);
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
		const payload = await jwt.verify(bearer) as user_select;
		if (payload) {
			return { user: payload };
		} else {
			throw new ServerError(error_messages.invalid_token, 401);
		}
	},

	refresh: async (token: string, jwt_refresh: JwtDecorator, jwt: JwtDecorator) => {
		const payload = await jwt_refresh.verify(token);
		if (payload) {
			const { remember_me, exp, iat, ...rest } = payload as any;
			const new_token = await jwt.sign(rest);
			let refresh_token;
			if (remember_me) {
				refresh_token = await jwt_refresh.sign({ ...rest, remember_me });
			}
			return { access_token: new_token, refresh_token };
		} else {
			throw new ServerError(error_messages.invalid_token, 400);
		}
	},

	generate_chat_access: async (id: number) => {
		const plain_key = crypto.randomUUID();
		const hashed_key = await Hasher.hash_token(plain_key);
		await user_repository.set_chat_access(id, hashed_key);
		return { chat_access: plain_key };
	}

}