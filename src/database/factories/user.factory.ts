import { fakerES as faker } from '@faker-js/faker';
import type { user_insert, UserRole } from "~/api/user/user.schema";

export const create_faker_user = ({
	profile_id,
	role = "customer",
	generate_password = true,
	generate_phone = true
}:{
	profile_id: number,
	role: UserRole,
	generate_password?: boolean,
	generate_phone?: boolean
}): user_insert => {
	return {
		email: faker.internet.email({
			provider: "mail.com",
		}).toLowerCase(),
		username: faker.internet.domainWord().toLowerCase(),
		password: generate_password ? faker.internet.password() : "password",
		role,
		phone_number: generate_phone ? faker.number.int({ min: 70000000, max: 79999999 }).toString() : undefined,
		profile_id,
		email_verified_at: new Date(),
	};
};