import z, { type ZodTypeAny } from "zod";
import type db from "~/database";

export interface PaginationType {
	limit: number,
	offset: number,
	search?: string,
	sort_by?: string,
	order?: 'asc' | 'desc',
}

export const PaginationTypeSchema = z.object({
	limit: z.coerce.number().optional().default(10),
	offset: z.coerce.number().optional().default(0),
	search: z.string().optional(),
	sort_by: z.string().optional(),
	order: z.enum(['asc', 'desc']).optional(),
})

export type ModelWhere<T extends keyof typeof db.query> = NonNullable<
	Parameters<(typeof db.query)[T]["findMany"]>[0]
>["where"];

export const ForceArrayPreprocess = <T extends ZodTypeAny>(schema: T) => z.preprocess(
	(val) => (Array.isArray(val) ? val : [val]),
	z.array(schema)
);