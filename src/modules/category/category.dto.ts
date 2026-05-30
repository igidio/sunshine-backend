import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export interface ReadCategoryDto extends PaginationType {}
export const ReadCategoryDtoSchema = PaginationTypeSchema;
export const CreateCategoryDtoSchema = z.object({
	name: z.string().max(60),
	description: z.string().max(255),
});
export type CreateCategoryDto = z.infer<typeof CreateCategoryDtoSchema>;
