import type { InferInsertModel } from "drizzle-orm";
import { user_schema } from "../schema";
import { Hasher } from "~/helpers/hasher";
import { create_faker_user } from "../factories/user.factory";
import type { user_insert } from "~/modules/user/user.schema";

type User = InferInsertModel<typeof user_schema>;

const users_with_hashed_passwords = async (users: User[]) => {
	return await Promise.all(users.map(async (user) => {
		const plain_key = crypto.randomUUID();
		const hashed_key = await Hasher.hash_password(plain_key);

		return {
			...user,
			password: await Hasher.hash_password(user.password),
			chat_access: Hasher.hash_token(hashed_key)
		}
	}))
}

const data: user_insert[] = [
	{
		username: "claudia",
		password: "password",
		email: "claudia@mail.com",
		profile_id: 1,
		role: "superuser",
		phone_number: "76543210",
		email_verified_at: new Date(),
	},
	{
		username: "carlos.garcia",
		password: "password2",
		email: "carlos_garcia@mail.com",
		profile_id: 2,
		role: "admin",
		phone_number: "70000003",
		email_verified_at: new Date(),
	},
	{
		username: "marina.sanchez",
		password: "password3",
		email: "marina_sanchez@mail.com",
		profile_id: 3,
		role: "employer",
		phone_number: "70000002",
		email_verified_at: new Date(),
		permissions: '["SUPPLIER","PRODUCT"]',
	},
	{
		username: "diego.fernandez",
		password: "password4",
		email: "diego_fernandez@mail.com",
		profile_id: 4,
		role: "employer",
		phone_number: "70000001",
		email_verified_at: new Date(),
		permissions: '["SUPPLIER","PRODUCT"]',
	},
	{
		username: "lucia.ramirez",
		password: "password5",
		email: "lucia_ramirez@mail.com",
		profile_id: 5,
		role: "admin",
		phone_number: "70000000",
		email_verified_at: new Date(),
	},
	create_faker_user({ profile_id: 6, role: "customer", generate_phone: false }),
	create_faker_user({ profile_id: 7, role: "customer", generate_phone: false }),
	create_faker_user({ profile_id: 8, role: "customer", generate_phone: false }),
	create_faker_user({ profile_id: 9, role: "customer", generate_phone: false }),
	create_faker_user({ profile_id: 10, role: "customer", generate_phone: false }),
]

export default {
	data: await users_with_hashed_passwords(data),
	type: user_schema
}