
import Elysia from "elysia";
import z from "zod";
import plugin_jwt from "~/plugins/jwt";
import { user_dto, user_login_dto } from "../user/user.dto";
import { profile_dto } from "../profile/profile.dto";
import { auth_service } from "./auth.service";
import bearer from "@elysia/bearer";
import { error_messages } from "~/data/error_messages";
import { user_service } from "../user/user.service";
import { ServerError } from "~/classes/server_error";

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
		body: user_login_dto,
	})

	.post("/signup", async ({ body, set }) => {
		await auth_service.signup(body);
		return "Signup successful";
	}, {
		body: z.object({
			user: user_dto,
			profile: profile_dto,
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

	;