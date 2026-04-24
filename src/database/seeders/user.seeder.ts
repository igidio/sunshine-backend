import type { InferInsertModel } from "drizzle-orm";
import { table_users } from "../schema";

type User = InferInsertModel<typeof table_users>;

const data: User[] = [
	{
		username: "claudia",
		password: "password1",
		email: "claudia@example.com",
	}
]

export default {
	data,
	type: table_users
};