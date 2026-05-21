import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export interface ReadProductDto extends PaginationType {
	status?: 'active' | 'inactive';
	min_price?: number;
	max_price?: number;
	min_stock?: number;
	max_stock?: number;
}

export const ReadProductDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
	min_price: z.coerce.number().nonnegative().optional(),
	max_price: z.coerce.number().nonnegative().optional(),
	min_stock: z.coerce.number().int().nonnegative().optional(),
	max_stock: z.coerce.number().int().nonnegative().optional(),
});

export interface CreateProductDto {
	name: string;
	description: string;
	price: number;
	image_url?: string | null;
}

export const CreateProductDtoSchema = z.object({
	name: z.string().max(255),
	description: z.string().max(1000),
	price: z.number().nonnegative(),
	image: z
		.file()
		.max(500 * 1024, "La imagen proporcionada es demasiado grande. Por favor, asegúrate de que la imagen sea menor a 500KB e intenta nuevamente.")
		.mime(["image/jpeg", "image/png", "image/webp"], "El formato de imagen proporcionado no es compatible. Por favor, asegúrate de que la imagen sea en formato JPEG o PNG e intenta nuevamente.")
		.nullish()
		.optional(),
});