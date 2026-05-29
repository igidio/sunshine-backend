import db from "~/database";
import { movement_schema, type movement_insert } from "./movement.schema";
import type { ReadMovementDto } from "./movement.dto";
import type { ModelWhere } from "~/helpers/types";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { and, count, eq, gte, isNull, like, lte, or, type SQL } from "drizzle-orm";

type MovementWhereConfig = ModelWhere<"movement_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];


const build_where_query = (pagination: ReadMovementDto): MovementWhereConfig => {
	return {
		deleted_at: {
			isNull: true,
		},
		...(pagination.type && { type: { eq: pagination.type } }),
		...(pagination.stock_id && { stock_id: { eq: pagination.stock_id } }),
		...(pagination.supplier_id && { supplier_id: { eq: pagination.supplier_id } }),
		...(pagination.from || pagination.to ? { AND: [{ created_at: { gte: pagination.from, lte: pagination.to } }] } : {}),
		...(pagination.search && {
			OR: [{ notes: { like: `%${pagination.search}%` } }],
		}),
	};
};

const build_where = (pagination: ReadMovementDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(isNull(movement_schema.deleted_at));

	if (pagination.type) conditions.push(eq(movement_schema.type, pagination.type));
	if (pagination.stock_id) conditions.push(eq(movement_schema.stock_id, pagination.stock_id));
	if (pagination.supplier_id) conditions.push(eq(movement_schema.supplier_id, pagination.supplier_id));
	if (pagination.from) conditions.push(gte(movement_schema.created_at, pagination.from));
	if (pagination.to) conditions.push(lte(movement_schema.created_at, pagination.to));

	if (pagination.search) {
		const searchFormatted = `%${pagination.search}%`;
		conditions.push(or(like(movement_schema.notes, searchFormatted)));
	}

	return and(...conditions);
};

export const movement_repository = {
	find_all: async (pagination: ReadMovementDto) => {
		return await db.query.movement_schema.findMany({
			columns: {
				deleted_at: false,
			},
			orderBy: {
				...pagination.sort_by && { [pagination.sort_by]: pagination.order },
			},
			with: {
				product: true,
				supplier: true,
			},
			limit: pagination.limit,
			offset: pagination.offset,
			where: build_where_query(pagination),
		});
	},

	find_one: async (id: number, tx?: DbTransaction) => {
		const database = tx || db;
		const result = await database.query.movement_schema.findFirst({
			with: {
				product: true,
				supplier: true,
			},
			where: {
				id: { eq: id },
				deleted_at: { isNull: true },

			}
		});
		return result;
	},

	count: async (pagination: ReadMovementDto) => {
		const [result] = await db
			.select({ total: count() })
			.from(movement_schema)
			.where(build_where(pagination));
		return result!.total;
	},

	create: async (data: movement_insert, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database.insert(movement_schema).values(data).$returningId();
		return result;
	},

	update: async (id: number, data: Partial<movement_insert>, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(movement_schema)
			.set(data)
			.where(and(eq(movement_schema.id, id), isNull(movement_schema.deleted_at)))
			.execute();
		return result;
	},

	delete: async (id: number, tx?: MySql2Database) => {
		const database = tx || db;
		return await database
			.update(movement_schema)
			.set({ deleted_at: new Date() })
			.where(and(eq(movement_schema.id, id), isNull(movement_schema.deleted_at)))
			.execute();
	},
};
