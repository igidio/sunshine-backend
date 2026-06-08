import z from "zod";
import { error_messages } from "~/data/error_messages";
import { ForceArrayPreprocess, IdsSchema, PaginationTypeSchema, StatusSchemaDto } from "~/helpers/types";

export const ReadProductDtoSchema = PaginationTypeSchema.extend({
	status: StatusSchemaDto.shape.status.optional().describe('Filtrar por estado del producto'),
	min_price: z.coerce.number().nonnegative().optional().describe('Precio mínimo'),
	max_price: z.coerce.number().nonnegative().optional().describe('Precio máximo'),
	min_stock: z.coerce.number().int().nonnegative().optional().describe('Stock mínimo'),
	max_stock: z.coerce.number().int().nonnegative().optional().describe('Stock máximo'),
	category_id: z.coerce.number().int().positive().optional().describe('Filtrar por ID de categoría'),
	ids: IdsSchema,
});
export type ReadProductDto = z.infer<typeof ReadProductDtoSchema>;

export const CreateProductDtoSchema = z.object({
	category_id: z.coerce.number().int().positive().describe('ID de la categoría'),
	name: z.string().min(1).max(255).describe('Nombre del producto'),
	description: z.string().min(1).max(1000).describe('Descripción'),
	price: z.coerce.number().nonnegative().describe('Precio'),
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
	images_to_remove: ForceArrayPreprocess(z.coerce.number()).optional().describe('IDs de imágenes a eliminar'),
}).extend(CreateProductDtoSchema.shape).partial();

export const McpCreateProductSchema = CreateProductDtoSchema.omit({ images: true })

export const McpUpdateProductSchema = McpCreateProductSchema.partial().extend({
	id: z.coerce.number().int().positive().describe('ID del producto a actualizar'),
	images_to_remove: ForceArrayPreprocess(z.coerce.number()).optional().describe('IDs de imágenes a eliminar'),
});