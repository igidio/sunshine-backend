import z from "zod";
import { PaginationTypeSchema } from "~/helpers/types";

export const ReadTreatmentDtoSchema = PaginationTypeSchema.extend({});
export type ReadTreatmentDto = z.infer<typeof ReadTreatmentDtoSchema>;

export const CreateTreatmentDtoSchema = z.object({
	name: z.string().max(255),
	description: z.string().max(2000),
	price: z.coerce.number().nonnegative(),
	duration: z.coerce.number().int().positive(),
});
export type CreateTreatmentDto = z.infer<typeof CreateTreatmentDtoSchema>;

export const UpdateTreatmentDtoSchema = CreateTreatmentDtoSchema.partial();
export type UpdateTreatmentDto = z.infer<typeof UpdateTreatmentDtoSchema>;

export const ToggleDisabledTreatmentDtoSchema = z.object({
	disabled: z.boolean().optional(),
});
export type ToggleDisabledTreatmentDto = z.infer<typeof ToggleDisabledTreatmentDtoSchema>;