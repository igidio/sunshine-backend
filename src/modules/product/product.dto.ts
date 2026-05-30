import z from "zod";
import { error_messages } from "~/data/error_messages";
import { ForceArrayPreprocess, PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export const ReadProductDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
	min_price: z.coerce.number().nonnegative().optional(),
	max_price: z.coerce.number().nonnegative().optional(),
	min_stock: z.coerce.number().int().nonnegative().optional(),
	max_stock: z.coerce.number().int().nonnegative().optional(),
	category_id: z.coerce.number().int().positive().optional(),
});
export type ReadProductDto = z.infer<typeof ReadProductDtoSchema>;


export const CreateProductDtoSchema = z.object({
	category_id: z.coerce.number().int().positive(),
	name: z.string().max(255),
	description: z.string().max(1000),
	price: z.coerce.number().nonnegative(),
	images: ForceArrayPreprocess(
		z.file()
			.max(500 * 1024, error_messages.invalid_image_size)
			.mime(["image/jpeg", "image/png", "image/webp", "image/avif"], error_messages.invalid_image_format)
	)
		.nullish()
		.optional().refine((files) => !files || (files.length >= 1 && files.length <= 5), {
			message: error_messages.invalid_image_count,
		}),
});
export type CreateProductDto = {
	images_to_remove?: number[] | null;
} & z.infer<typeof CreateProductDtoSchema>;

export const UpdateProductDtoSchema = CreateProductDtoSchema.partial();

export type UpdateProductDto = {
	images_to_remove?: number[] | null;
} & z.infer<typeof UpdateProductDtoSchema>;

export const ImagesToRemoveDtoSchema = z.object({
	images_to_remove: ForceArrayPreprocess(z.coerce.number()).optional(),
}).extend(CreateProductDtoSchema.shape).partial();