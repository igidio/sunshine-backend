import z from "zod";

const password = z.string().min(8);

export const user_dto = z.object({
	username: z.string().min(4).max(32),
	password,
	email: z.email().max(255),
	phone_number: z.string().max(20),
})

export const user_login_dto = z.object({
	username_or_email: z.string().min(1),
	password,
	remember_me: z.boolean().optional()
})
