import db from "~/database"
import type { ReadWishlistDto } from "./wishlist.dto";
import { and, count, eq, gte, lte, type SQL } from "drizzle-orm";
import { wishlist_schema, type wishlist_insert } from "./wishlist.schema";

export const build_where_query = (query: ReadWishlistDto, customer_id: number) => {
	return {
		customer_id: { eq: customer_id },
		...(query.from && { added_at: { gte: query.from } }),
		...(query.to && { added_at: { lte: query.to } }),
	};
};

export const build_where = (query: ReadWishlistDto, customer_id: number): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(eq(wishlist_schema.customer_id, customer_id));

	if (query.from) conditions.push(gte(wishlist_schema.added_at, query.from));
	if (query.to) conditions.push(lte(wishlist_schema.added_at, query.to));

	return and(...conditions);
};

export const wishlist_repository = {
	find_all: async (query: ReadWishlistDto, customer_id: number) => {
		return await db.query.wishlist_schema.findMany({
			with: {
				product: {
					with: {
						images: true,
						category: true,
					}
				}
			},
			orderBy: {
				...(query.sort_by && { [query.sort_by]: query.order }),
				...(!query.sort_by && { added_at: 'desc' }),
			},
			limit: query.limit,
			offset: query.offset,
			where: build_where_query(query, customer_id),
		});
	},

	count: async (query: ReadWishlistDto, customer_id: number) => {
		const [result] = await db
			.select({ total: count() })
			.from(wishlist_schema)
			.where(build_where(query, customer_id));
		return result!.total;
	},

	find_one: async (id: number, customer_id: number) => {
		return await db.query.wishlist_schema.findFirst({
			where: {
				id: { eq: id },
				customer_id: { eq: customer_id }
			},
			with: {
				product: {
					with: {
						images: true,
						category: true,
					}
				}
			}
		});
	},

	create: async (data: wishlist_insert) => {
		const [result] = await db.insert(wishlist_schema).values(data).$returningId();
		return result;
	},

	delete_all: async (customer_id: number) => {
		return await db
			.delete(wishlist_schema)
			.where(eq(wishlist_schema.customer_id, customer_id))
			.execute();
	},

	delete_one: async (id: number, customer_id: number) => {
		return await db
			.delete(wishlist_schema)
			.where(and(eq(wishlist_schema.id, id), eq(wishlist_schema.customer_id, customer_id)))
			.execute();
	}
};
