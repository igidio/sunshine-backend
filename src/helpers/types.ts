import z from "zod";
import type db from "~/database";

export const PaginationTypeSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).optional().default(10).describe('Cantidad de registros por página'),
	offset: z.coerce.number().int().min(0).optional().default(0).describe('Número de registros a saltar'),
	search: z.string().optional().describe('Texto de búsqueda por nombre o descripción'),
	sort_by: z.string().optional().describe('Campo por el cual ordenar'),
	order: z.enum(['asc', 'desc']).optional().describe('Dirección del ordenamiento'),
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

export const IdsSchema = z.preprocess(
	(val) => {
		if (val === undefined || val === null) return undefined;
		if (Array.isArray(val)) return val;
		if (typeof val === "string") return val.split(",").map((v) => v.trim()).filter(Boolean);
		return [val];
	},
	z.array(z.coerce.number().int().positive()).optional()
);
