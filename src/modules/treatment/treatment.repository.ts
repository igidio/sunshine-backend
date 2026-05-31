import db from "~/database";
import { treatment_schema, type treatment_insert } from "./treatment.schema";
import type { CreateTreatmentDto, ReadTreatmentDto } from "./treatment.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, isNull, like, or, type SQL } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

type TreatmentWhereConfig = ModelWhere<"treatment_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const build_where_query = (pagination: ReadTreatmentDto): TreatmentWhereConfig => {
	return {
		deleted_at: {
			isNull: true,
		},
		...(pagination.search && {
			OR: [
				{ name: { like: `%${pagination.search}%` } },
				{ description: { like: `%${pagination.search}%` } },
			],
		}),
	};
};

const build_where = (pagination: ReadTreatmentDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(isNull(treatment_schema.deleted_at));

	if (pagination.search) {
		const searchFormatted = `%${pagination.search}%`;
		conditions.push(
			or(
				like(treatment_schema.name, searchFormatted),
				like(treatment_schema.description, searchFormatted)
			)
		);
	}

	return and(...conditions);
};

export const treatment_repository = {
	create: async (data: CreateTreatmentDto, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database.insert(treatment_schema).values(data).$returningId();
		return result;
	},

	find_all: async (pagination: ReadTreatmentDto) => {
		return await db.query.treatment_schema.findMany({
			columns: {
				deleted_at: false,
			},
			orderBy: {
				...(pagination.sort_by && { [pagination.sort_by]: pagination.order }),
			},
			limit: pagination.limit,
			offset: pagination.offset,
			where: build_where_query(pagination),
		});
	},

	find_one: async (id: number, tx?: DbTransaction) => {
		const database = tx || db;
		return await database.query.treatment_schema.findFirst({
			where: {
				id: {
					eq: id,
				},
				deleted_at: {
					isNull: true,
				},
			},
		});
	},

	count: async (pagination: ReadTreatmentDto) => {
		const [result] = await db
			.select({ total: count() })
			.from(treatment_schema)
			.where(build_where(pagination));
		return result!.total;
	},

	update: async (id: number, data: Partial<treatment_insert>, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(treatment_schema)
			.set(data)
			.where(and(eq(treatment_schema.id, id), isNull(treatment_schema.deleted_at)))
			.execute();
		return result;
	},

	delete: async (id: number, tx?: MySql2Database) => {
		const database = tx || db;
		return await database
			.update(treatment_schema)
			.set({ deleted_at: new Date() })
			.where(and(eq(treatment_schema.id, id), isNull(treatment_schema.deleted_at)))
			.execute();
	},

	toggle_disabled: async (id: number, disabled_at: Date | null, tx?: MySql2Database) => {
		const database = tx || db;
		return await database
			.update(treatment_schema)
			.set({ disabled_at })
			.where(and(eq(treatment_schema.id, id), isNull(treatment_schema.deleted_at)))
			.execute();
	},
};