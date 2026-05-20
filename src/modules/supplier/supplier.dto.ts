import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export interface ReadSupplierDto extends PaginationType {
	status?: 'active' | 'inactive';
}

export const ReadSupplierDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
});

export interface CreateSupplierDto {
	name: string;
	email: string;
	phone_number: string;
	address: string;
	description: string;
	image_url?: string;
}

export const CreateSupplierDtoSchema = z.object({
	name: z.string().max(255),
	email: z.email(),
	phone_number: z.string().max(20),
	address: z.string().max(255),
	description: z.string().max(1000),
	image: z
		.file()
		.max(500 * 1024, "La imagen proporcionada es demasiado grande. Por favor, asegúrate de que la imagen sea menor a 500KB e intenta nuevamente.")
		.mime(["image/jpeg", "image/png", "image/webp"], "El formato de imagen proporcionado no es compatible. Por favor, asegúrate de que la imagen sea en formato JPEG o PNG e intenta nuevamente.")
		.optional(),
});