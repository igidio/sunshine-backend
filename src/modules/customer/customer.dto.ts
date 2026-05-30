import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";
import { CreateProfileDtoSchema } from "../profile/profile.dto";

export const ReadCustomerDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
});
export interface ReadCustomerDto extends PaginationType {
	status?: 'active' | 'inactive';
}
export const CreateCustomerDtoSchema = z.object({
	phone_number: z.string().max(10).optional()
}).extend(CreateProfileDtoSchema.shape);
export type CreateCustomerDto = z.infer<typeof CreateCustomerDtoSchema>;

export const ToggleDisabledCustomerDtoSchema = z.object({
	disabled: z.boolean().optional()
});

export const UpdateCustomerDtoSchema = CreateCustomerDtoSchema.partial();
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerDtoSchema>;
