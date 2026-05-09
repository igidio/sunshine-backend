import type { InferInsertModel } from "drizzle-orm";
import { profile_schema } from "~/api/profile/profile.schema";
import { create_faker_profile } from "../factories/profile.factory";

type Profile = InferInsertModel<typeof profile_schema>;

const data: Profile[] = [
	{
		first_name: "Claudia",
		last_name: "Magariños",
		birth_date: new Date("1990-01-01"),
		address: "Calle ABC 123",
	},
	{
		first_name: "Carlos",
		last_name: "García",
		birth_date: new Date("1992-07-05"),
		address: "Paseo del Prado 28",
	},
	{
		first_name: "Marina",
		last_name: "Sánchez",
		birth_date: new Date("1985-11-20"),
		address: "Plaza de la Luna 3",
	},
	{
		first_name: "Diego",
		last_name: "Fernández",
		birth_date: new Date("1995-02-18"),
		address: "Camino Real 57",
	},
	{
		first_name: "Lucía",
		last_name: "Ramírez",
		birth_date: new Date("1990-09-09"),
		address: "Avenida del Sol 46",
	},
	create_faker_profile(),
	create_faker_profile(),
	create_faker_profile(),
	create_faker_profile(),
	create_faker_profile(),
];

export default {
	data,
	type: profile_schema
};