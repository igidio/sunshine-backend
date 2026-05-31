import z from "zod";
import { PaginationTypeSchema, StatusSchemaDto, type PaginationType } from "~/helpers/types";
import { CreateProfileDtoSchema } from "../profile/profile.dto";

export const ReadCustomerDtoSchema = PaginationTypeSchema.extend({
	status: StatusSchemaDto.shape.status.optional(),
});
export type ReadCustomerDto = z.infer<typeof ReadCustomerDtoSchema>;

export const CreateCustomerDtoSchema = z.object({
	phone_number: z.string().max(10).optional()
}).extend(CreateProfileDtoSchema.shape);
export type CreateCustomerDto = z.infer<typeof CreateCustomerDtoSchema>;

export const ToggleDisabledCustomerDtoSchema = z.object({
	disabled: z.boolean().optional()
});
export type ToggleDisabledCustomerDto = z.infer<typeof ToggleDisabledCustomerDtoSchema>;

export const UpdateCustomerDtoSchema = CreateCustomerDtoSchema.partial();
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerDtoSchema>;
