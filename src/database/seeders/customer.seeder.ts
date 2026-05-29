import { faker } from "@faker-js/faker";
import { customer_schema, type customer_insert } from "~/modules/customer/customer.schema";

const generate = (start: number, amount: number): customer_insert[] => {
	const data: customer_insert[] = [];
	for (let i = 0; i < amount; i++) {
		data.push({
			profile_id: start + i,
			phone_number: `7${faker.string.numeric(7)}`
		});
	}
	return data;
}

const data: customer_insert[] = [
	...generate(6, 10)
]

export default {
	data,
	type: customer_schema
}