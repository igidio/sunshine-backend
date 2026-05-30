import z from "zod";
import type db from "~/database";

export const PaginationTypeSchema = z.object({
	limit: z.coerce.number().optional().default(10),
	offset: z.coerce.number().optional().default(0),
	search: z.string().optional(),
	sort_by: z.string().optional(),
	order: z.enum(['asc', 'desc']).optional(),
})

export type PaginationType = z.infer<typeof PaginationTypeSchema>;

export const IdSchema = z.object({
	id: z.coerce.number(),
})

export const StatusSchemaDto = z.object({
	status: z.enum(['active', 'inactive'])
})
export type StatusDto = z.infer<typeof StatusSchemaDto>;
export const ToggleStatusSchemaDto = z.object({
	status: z.enum(['enable', 'disable']).optional()
})
export type ToggleStatusDto = z.infer<typeof ToggleStatusSchemaDto>;


export type ModelWhere<T extends keyof typeof db.query> = NonNullable<
	Parameters<(typeof db.query)[T]["findMany"]>[0]
>["where"];

export const ForceArrayPreprocess = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(
	(val) => (Array.isArray(val) ? val : [val]),
	z.array(schema)
);
