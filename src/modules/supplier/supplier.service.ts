import { create } from "domain";
import { supplier_repository } from "./supplier.repository";

export const supplier_service = {
	get: async () => {
		return await supplier_repository.get();
	},

	create: async ({ name, email, phone_number, address, description }: { name: string; email: string; phone_number: string; address: string; description: string }) => {
		return await supplier_repository.create({
			address: address,
			email: email,
			name: name,
			phone_number,
			description,
		});
	}
}