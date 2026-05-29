import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export interface ReadCustomerDto extends PaginationType {
	status?: 'active' | 'inactive';
}

export const ReadCustomerDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
});

export interface CreateCustomerDto {
	first_name: string;
	last_name: string;
	birth_date: Date;
	address?: string;
	phone_number?: string;
}

export const CreateCustomerDtoSchema = z.object({
	first_name: z.string().min(1).max(255),
	last_name: z.string().min(1).max(255),
	birth_date: z.coerce.date(),
	address: z.string().max(255).optional(),
	phone_number: z.string().max(10).optional()
});
