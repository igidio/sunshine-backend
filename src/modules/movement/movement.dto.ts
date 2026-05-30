import z from "zod";
import { PaginationTypeSchema } from "~/helpers/types";
import { movement_type } from "./movement.schema";

export const ReadMovementDtoSchema = PaginationTypeSchema.extend({
	type: z.enum(movement_type).optional(),
	stock_id: z.coerce.number().int().positive().optional(),
	supplier_id: z.coerce.number().int().positive().optional(),
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
});

export type ReadMovementDto = z.infer<typeof ReadMovementDtoSchema>;


export const CreateMovementDtoSchema = z.object({
	stock_id: z.coerce.number().int().positive(),
	supplier_id: z.coerce.number().int().positive().nullable().optional(),
	type: z.enum(movement_type).optional(),
	quantity: z.coerce.number().int(),
	notes: z.string().max(2000).nullable().optional(),
});

export type CreateMovementDto = z.infer<typeof CreateMovementDtoSchema>;

export const UpdateMovementDtoSchema = CreateMovementDtoSchema.partial()

export type UpdateMovementDto = z.infer<typeof UpdateMovementDtoSchema>;