
import Elysia from "elysia";
import z from "zod";
import plugin_jwt from "~/plugins/jwt";
import { user_dto, user_login_dto } from "../user/user.dto";
import { profile_dto } from "../profile/profile.dto";
import { auth_service } from "./auth.service";

export const auth_routes = new Elysia({
	prefix: "/auth"
})
	.use(plugin_jwt)
	.post("/", async ({ body, set, jwt }) => {
		const { username_or_email, password } = body;

		if (username_or_email === "admin" && password === "password") {
			const token = await jwt.sign({ id: 1 });
			set.status = 200;
			return { token };
		} else {
			set.status = 401;
			return { error: "Invalid credentials" };
		}

	}, {
		body: user_login_dto
	})
	.post("/signup", async ({ body, set }) => {
		await auth_service.signup(body);
		return "Signup successful";
	}, {
		body: z.object({
			user: user_dto,
			profile: profile_dto
		})
	});