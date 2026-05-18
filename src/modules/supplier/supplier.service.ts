import { create } from "domain";
import { supplier_repository } from "./supplier.repository";
import type { PaginationType } from "~/helpers/types";
import type { ReadSupplierDto } from "./supplier.dto";



export const supplier_service = {
	get: async (params: ReadSupplierDto) => {

		const count = await supplier_repository.count(params);
		return await supplier_repository.get(params);

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