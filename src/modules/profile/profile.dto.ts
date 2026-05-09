import z from "zod";

export const profile_dto = z.object({
	first_name: z.string().max(255),
	last_name: z.string().max(255),
	birth_date: z.coerce.date(),
	identity_number: z.string().max(20),
});

