import z from "zod";

export const CreateProfileDtoSchema = z.object({
	first_name: z.string().min(3).max(255),
	last_name: z.string().min(3).max(255),
	birth_date: z.coerce.date().transform((val) => val.toISOString().split('T')[0]).default("1970-01-01"),
	address: z.string().min(3).max(255).optional(),
	identity_number: z.string().max(20).optional(),
});
export type CreateProfileDto = z.infer<typeof CreateProfileDtoSchema>;
export const UpdateProfileDtoSchema = CreateProfileDtoSchema.partial();
export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;

