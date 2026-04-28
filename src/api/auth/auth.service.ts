import type z from "zod";
import type { user_dto } from "../user/user.dto";
import type { profile_dto } from "../profile/profile.dto";
import { auth_repository } from "./auth.repository";
import jwt from "@elysia/jwt";

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

	verify: async (bearer: string, jwt: JwtDecorator) => {
		const is_valid = await jwt.verify(bearer);
		if (is_valid) {
			return { valid: true };
		} else {
			return { valid: false };
		}
	},

	refresh: async (bearer: string, jwt: JwtDecorator) => {
		const is_valid = await jwt.verify(bearer);
		if (is_valid) {
			const new_token = await jwt.sign({ id: 1 });
			return { access_token: new_token };
		} else {
			return { error: "Invalid refresh token" };
		}
	}
}