import z from "zod";
import { ForceArrayPreprocess, IdsSchema, PaginationTypeSchema } from "~/helpers/types";

export const ReadSaleDtoSchema = PaginationTypeSchema.extend({
	customer_id: z.coerce.number().int().positive().optional(),
	ids: IdsSchema,
});
export type ReadSaleDto = z.infer<typeof ReadSaleDtoSchema>;

export const CreateSaleDtoSchema = z.object({
	customer_id: z.coerce.number().int().positive(),
	product_ids: ForceArrayPreprocess(z.coerce.number().int().positive()).optional().default([]),
	appointment_ids: ForceArrayPreprocess(z.coerce.number().int().positive()).optional().default([]),
	payment_method: z.enum(["cash", "card", "transfer"]),
});
export type CreateSaleDto = z.infer<typeof CreateSaleDtoSchema>;

export const UpdateSaleDtoSchema = CreateSaleDtoSchema.partial();
export type UpdateSaleDto = z.infer<typeof UpdateSaleDtoSchema>;
