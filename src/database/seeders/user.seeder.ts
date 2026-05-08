import type { InferInsertModel } from "drizzle-orm";
import { user_schema } from "../schema";

type User = InferInsertModel<typeof user_schema>;

const data: User[] = [
	{
		username: "claudia",
		password: "password",
		email: "claudia@mail.com",
		profile_id: 1,
		role: "admin",
		phone_number: "612345678",
		email_verified_at: new Date(),
	},
	{
		username: "carlos.garcia",
		password: "password2",
		email: "carlos.garcia@example.com",
		profile_id: 2,
		role: "employer",
		phone_number: "613456789",
		email_verified_at: new Date(),
	},
	{
		username: "marina.sanchez",
		password: "password3",
		email: "marina.sanchez@example.com",
		profile_id: 3,
		role: "employer",
		phone_number: "614567890",
		email_verified_at: new Date(),
	},
	{
		username: "diego.fernandez",
		password: "password4",
		email: "diego.fernandez@example.com",
		profile_id: 4,
		role: "employer",
		phone_number: "615678901",
		email_verified_at: new Date(),
	},
	{
		username: "lucia.ramirez",
		password: "password5",
		email: "lucia.ramirez@example.com",
		profile_id: 5,
		role: "admin",
		phone_number: "616789012",
		email_verified_at: new Date(),
	},
]

export default {
	data,
	type: user_schema
};