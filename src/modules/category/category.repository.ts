import db from "~/database";
import { category_schema, type category_insert } from "./category.schema";
import type { ReadCategoryDto } from "./category.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, isNull, like, or, type SQL } from "drizzle-orm";

type CategoryWhereConfig = ModelWhere<"category_schema">;

const build_where_query = (pagination: ReadCategoryDto): CategoryWhereConfig => {
	return {
		deleted_at: {
			isNull: true
		},
		...(pagination.search && {
			OR: [
				{ name: { like: `%${pagination.search}%` } },
				{ description: { like: `%${pagination.search}%` } },
			]
		})
	};
};

const build_where = (pagination: ReadCategoryDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(isNull(category_schema.deleted_at));

	if (pagination.search) {
		const searchFormatted = `%${pagination.search}%`;
		conditions.push(
			or(
				like(category_schema.name, searchFormatted),
				like(category_schema.description, searchFormatted)
			)
		);
	}

	return and(...conditions);
};

export const category_repository = {
	find_all: async (pagination: ReadCategoryDto) => {
		return await db.query.category_schema.findMany({
			columns: {
				deleted_at: false,
			},
			orderBy: {
				...pagination.sort_by && { [pagination.sort_by]: pagination.order }
			},
			limit: pagination.limit,
			offset: pagination.offset,
			where: build_where_query(pagination),
		});
	},

	find_one: async (id: number) => {
		return await db.query.category_schema.findFirst({
			where: {
				id,
			}
		});
	},

	count: async (pagination: ReadCategoryDto) => {
		const [result] = await db.select({ total: count() })
			.from(category_schema)
			.where(build_where(pagination));
		return result!.total;
	},

	create: async (data: category_insert) => {
		const [result] = await db.insert(category_schema).values(data).$returningId();
		return result;
	},

	update: async (id: number, data: Partial<category_insert>) => {
		const [result] = await db
			.update(category_schema)
			.set(data)
			.where(and(eq(category_schema.id, id), isNull(category_schema.deleted_at)))
			.execute();
		return result;
	},

	delete: async (id: number) => {
		return await db
			.delete(category_schema)
			.where(and(eq(category_schema.id, id), isNull(category_schema.deleted_at)))
			.execute();
	}
};