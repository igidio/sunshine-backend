import type z from "zod";
import type { user_dto } from "../user/user.dto";
import type { profile_dto } from "../profile/profile.dto";
import { auth_repository } from "./auth.repository";

export const auth_service = {
	signup: async (
		body: {
			user: z.infer<typeof user_dto>,
			profile: z.infer<typeof profile_dto>
		}
	) => {		
		return auth_repository.create_user(body);
	}
}