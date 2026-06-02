import z from "zod";
import { PaginationTypeSchema } from "~/helpers/types";

export const ReadWishlistDtoSchema = PaginationTypeSchema.extend({
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
});

export type ReadWishlistDto = z.infer<typeof ReadWishlistDtoSchema>;

export const CreateWishlistDtoSchema = z.object({
	product_id: z.coerce.number().int().positive(),
});

export type CreateWishlistDto = z.infer<typeof CreateWishlistDtoSchema>;
