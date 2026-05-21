import db from "~/database"
import type { ReadProductDto } from "./product.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, gte, isNotNull, isNull, like, lte, or, type SQL } from "drizzle-orm";
import { product_schema } from "./product.schema";
import { stock_schema } from "../stock/stock.schema";

type ProductWhereConfig = ModelWhere<'product_schema'>;

export const build_where_query = (pagination: ReadProductDto): ProductWhereConfig => {
	return {
		deleted_at: {
			isNull: true
		},
		...(pagination.status === 'active' && { disabled_at: { isNull: true } }),
		...(pagination.status === 'inactive' && { disabled_at: { isNotNull: true } }),
		...(pagination.search && {
			OR: [
				{ name: { like: `%${pagination.search}%` } },
				{ description: { like: `%${pagination.search}%` } },
			]
		}),
		...{
			price: {
				...(pagination.min_price !== undefined && { gte: pagination.min_price }),
				...(pagination.max_price !== undefined && { lte: pagination.max_price })
			}
		},
	}
}

export const build_where = (pagination: ReadProductDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(isNull(product_schema.deleted_at));

	if (pagination.status === 'active') {
		conditions.push(isNull(product_schema.disabled_at));
	} else if (pagination.status === 'inactive') {
		conditions.push(isNotNull(product_schema.disabled_at));
	}

	if (pagination.search) {
		const searchFormatted = `%${pagination.search}%`;
		conditions.push(
			or(
				like(product_schema.name, searchFormatted),
				like(product_schema.description, searchFormatted)
			)
		);
	}

	if (pagination.min_price !== undefined) conditions.push(gte(product_schema.price, pagination.min_price));

	if (pagination.max_price !== undefined)
		conditions.push(lte(product_schema.price, pagination.max_price));

	return and(...conditions);
};

export const product_repository = {

	find_all: async (query: ReadProductDto) => {
		return await db.query.product_schema.findMany({
			columns: {
				deleted_at: false,
			},
			with: {
				images: true,
				stock: {
					where: {
						deleted_at: {
							isNull: true
						},
						...{
							quantity: {
								...(query.min_stock !== undefined && { gte: query.min_stock }),
								...(query.max_stock !== undefined && { lte: query.max_stock })
							}
						}
					}
				},
			},
			orderBy: {
				...query.sort_by && { [query.sort_by]: query.order }
			},
			limit: query.limit,
			offset: query.offset,
			where: build_where_query(query),

		})
	},

	find_one: async (id: number) => {
		return await db.query.product_schema.findFirst({
			with: {
				images: true,
				stock: true,
			}
		})
	},

	count: async (query: ReadProductDto) => {
		const conditions: (SQL | undefined)[] = [build_where(query)];

		if (query.min_stock !== undefined) {
			conditions.push(gte(stock_schema.quantity, query.min_stock));
		}

		if (query.max_stock !== undefined) {
			conditions.push(lte(stock_schema.quantity, query.max_stock));
		}

		const [result] = await db
			.select({ total: count() })
			.from(product_schema)
			.innerJoin(stock_schema, eq(product_schema.id, stock_schema.product_id))
			.where(and(...conditions));


		return result!.total;
	}
};
