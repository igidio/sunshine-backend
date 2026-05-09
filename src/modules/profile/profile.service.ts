import type z from "zod";
import { profile_dto } from "./profile.dto";
import { profile_repository } from "./profile.repository";

export const profile_service = {
	get_all_profiles: async () => {
		return "Get all profiles";
	},

	get_profile_by_id: async (id: string) => {
		return `Get profile with id ${id}`;
	},

	update_profile_by_id: async (id: string, body: z.infer<typeof profile_dto>) => {
		return `Update profile with id ${id}`;
	},

	delete_profile_by_id: async (id: string) => {
		return `Delete profile with id ${id}`;
	}
};
