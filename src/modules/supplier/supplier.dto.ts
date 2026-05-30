import z from "zod";
import { error_messages } from "~/data/error_messages";
import { PaginationTypeSchema } from "~/helpers/types";

export const ReadSupplierDtoSchema = PaginationTypeSchema.extend({
	status: z.enum(['active', 'inactive']).optional(),
});

export type ReadSupplierDto = z.infer<typeof ReadSupplierDtoSchema>;

export const CreateSupplierDtoSchema = z.object({
	name: z.string().max(255),
	email: z.email(),
	phone_number: z.string().max(20),
	address: z.string().max(255),
	description: z.string().max(1000),
	image: z
		.file()
		.max(500 * 1024, error_messages.invalid_image_size)
		.mime(["image/jpeg", "image/png", "image/webp", "image/avif"], error_messages.invalid_image_format)
		.nullish()
		.optional(),
});

export type CreateSupplierDto = {
	image_url: string | null | undefined;
} & z.infer<typeof CreateSupplierDtoSchema>;

export const UpdateSupplierDtoSchema = CreateSupplierDtoSchema.extend({
	keep_image: z.coerce.boolean().optional(),
}).partial();

export type UpdateSupplierDto = {
	image_url?: string | null | undefined;
} & z.infer<typeof UpdateSupplierDtoSchema>;