import Elysia from "elysia";
import z from "zod";
import plugin_jwt from "~/plugins/jwt";
import { CreateUserDtoSchema, UserLoginDtoSchema, UpdateUserDtoSchema, UpdateUserPasswordDtoSchema } from "../user/user.dto";
import { CreateProfileDtoSchema, UpdateProfileDtoSchema } from "../profile/profile.dto";
import { auth_service } from "./auth.service";
import bearer from "@elysia/bearer";
import { error_messages } from "~/data/error_messages";
import { user_service } from "../user/user.service";
import { ServerError } from "~/classes/server_error";
import { profile_service } from "../profile/profile.service";

export const auth_routes = new Elysia({
	prefix: "/auth"
})
	.use(plugin_jwt)
	.use(bearer())
	.post("/", async ({ body, set, jwt, jwt_refresh }) => {
		set.status = 200;
		const { username_or_email, password, remember_me } = body;
		const user = await auth_service.sign_in(username_or_email, password);
		const to_sign = { id: user.id, email: user.email, username: user.username };
		const token = await jwt.sign(to_sign);
		const refresh_token = await jwt_refresh.sign({ ...to_sign, remember_me });
		return { "access_token": token, "refresh_token": refresh_token };
	}, {
		body: UserLoginDtoSchema,
	})

	.post("/signup", async ({ body, jwt, jwt_refresh }) => {
		const user = await auth_service.sign_up(body);
		const to_sign = { id: user.id, email: user.email, username: user.username };
		const token = await jwt.sign(to_sign);
		const refresh_token = await jwt_refresh.sign(to_sign);
		return { "access_token": token, "refresh_token": refresh_token };
	}, {
		body: z.object({
			user: CreateUserDtoSchema,
			profile: CreateProfileDtoSchema,
		})
	})

	.post("/verify", async ({ jwt, bearer }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		return await auth_service.verify(bearer, jwt);
	})

	.post("/info", async ({ jwt, bearer }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		const auth_info = await auth_service.get_authenticated_user(bearer, jwt);
		return await user_service.find_one(auth_info.user.id);
	})

	.post("/refresh", async ({ jwt, jwt_refresh, bearer, body }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);

		return await auth_service.refresh(body.refresh_token, jwt_refresh, jwt);
	}, {
		body: z.object({
			refresh_token: z.string(),
		})
	})

	.post("/chat-access", async ({ jwt, bearer }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		const auth_info = await auth_service.get_authenticated_user(bearer, jwt);
		const user = await user_service.find_one(auth_info.user.id);

		if (user.disabled_at) {
			throw new ServerError(error_messages.user_disabled, 403);
		}
		if (!user.email_verified_at) {
			throw new ServerError(error_messages.email_not_verified, 403);
		}

		return await auth_service.generate_chat_access(user.id);
	})

	.patch("/user", async ({ jwt, bearer, body }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		const auth_info = await auth_service.get_authenticated_user(bearer, jwt);
		if (auth_info.user.disabled_at) throw new ServerError(error_messages.user_disabled, 403);
		return await user_service.update(auth_info.user.id, body);
	}, {
		body: UpdateUserDtoSchema,
	})

	.patch("/profile", async ({ jwt, bearer, body }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		const auth_info = await auth_service.get_authenticated_user(bearer, jwt);
		if (auth_info.user.disabled_at) throw new ServerError(error_messages.user_disabled, 403);
		const user = await user_service.find_one(auth_info.user.id);
		await profile_service.update_profile_by_id(user.profile_id, body);
		return await user_service.find_one(auth_info.user.id);
	}, {
		body: UpdateProfileDtoSchema,
	})

	.patch("/password", async ({ jwt, bearer, body }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		const auth_info = await auth_service.get_authenticated_user(bearer, jwt);
		if (auth_info.user.disabled_at) throw new ServerError(error_messages.user_disabled, 403);
		return await user_service.update_password(auth_info.user.id, body);
	}, {
		body: UpdateUserPasswordDtoSchema,
	});