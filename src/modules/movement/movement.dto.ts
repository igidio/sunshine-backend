import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";
import { movement_type, type MovementType } from "./movement.schema";

export interface ReadMovementDto extends PaginationType {
	type?: MovementType;
	stock_id?: number;
	supplier_id?: number;
	from?: Date;
	to?: Date;
}

export const ReadMovementDtoSchema = PaginationTypeSchema.extend({
	type: z.enum(movement_type).optional(),
	stock_id: z.coerce.number().int().positive().optional(),
	supplier_id: z.coerce.number().int().positive().optional(),
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
});

export interface CreateMovementDto {
	stock_id: number;
	supplier_id?: number | null;
	type?: MovementType;
	quantity: number;
	notes?: string | null;
}

export const CreateMovementDtoSchema = z.object({
	stock_id: z.coerce.number().int().positive(),
	supplier_id: z.coerce.number().int().positive().nullable().optional(),
	type: z.enum(movement_type).optional(),
	quantity: z.coerce.number().int(),
	notes: z.string().max(2000).nullable().optional(),
});
