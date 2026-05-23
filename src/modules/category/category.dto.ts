import z from "zod";
import { PaginationTypeSchema, type PaginationType } from "~/helpers/types";

export interface ReadCategoryDto extends PaginationType {}

export const ReadCategoryDtoSchema = PaginationTypeSchema;

export interface CreateCategoryDto {
	name: string;
	description: string;
}

export const CreateCategoryDtoSchema = z.object({
	name: z.string().max(60),
	description: z.string().max(255),
});
