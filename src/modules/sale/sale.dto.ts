import z from "zod";
import { ForceArrayPreprocess, IdsSchema, PaginationTypeSchema } from "~/helpers/types";
import { sale_payment_method } from "./sale.schema";

export const ReadSaleDtoSchema = PaginationTypeSchema.extend({
	customer_id: z.coerce.number().int().positive().optional(),
	ids: IdsSchema,
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
	payment_method: z.enum(sale_payment_method).optional(),
	min_price: z.coerce.number().nonnegative().optional(),
	max_price: z.coerce.number().nonnegative().optional(),
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
