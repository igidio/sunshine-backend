import { supplier_repository } from "./supplier.repository";

export const supplier_service = {
	get: async () => {
		return await supplier_repository.get();
	}
}