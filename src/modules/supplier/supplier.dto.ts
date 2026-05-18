import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export interface ReadSupplierDto extends PaginationType {
	status?: 'active' | 'inactive';
}

export const ReadSupplierDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
});