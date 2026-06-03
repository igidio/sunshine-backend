import db from "~/database";
import type { ReadSaleDto } from "./sale.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, gte, inArray, like, lte, or, type SQL } from "drizzle-orm";
import { sale_schema, sale_product_detail_schema, sale_appointment_detail_schema, type sale_insert, type sale_product_detail_insert, type sale_appointment_detail_insert } from "./sale.schema";
import { customer_schema } from "../customer/customer.schema";
import { profile_schema } from "../profile/profile.schema";

type SaleWhereConfig = ModelWhere<"sale_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const build_where_query = (query: ReadSaleDto): SaleWhereConfig => {
	return {
		...(query.customer_id && { customer_id: { eq: query.customer_id } }),
		...(query.ids && query.ids.length > 0 && { id: { in: query.ids } }),
		...(query.payment_method && { payment_method: { eq: query.payment_method } }),
		...((query.from || query.to) && {
			created_at: {
				...(query.from && { gte: query.from }),
				...(query.to && { lte: query.to }),
			},
		}),
		...{
			total: {
				...(query.min_price !== undefined && { gte: query.min_price }),
				...(query.max_price !== undefined && { lte: query.max_price }),
			},
		},
		...(query.search && {
			customer: {
				profile: {
					OR: [
						{ first_name: { like: `%${query.search}%` } },
						{ last_name: { like: `%${query.search}%` } },
					],
				},
			},
		}),
	};
};

const build_where = (query: ReadSaleDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	if (query.customer_id) conditions.push(eq(sale_schema.customer_id, query.customer_id));
	if (query.ids && query.ids.length > 0) conditions.push(inArray(sale_schema.id, query.ids));
	if (query.payment_method) conditions.push(eq(sale_schema.payment_method, query.payment_method));
	if (query.from) conditions.push(gte(sale_schema.created_at, query.from));
	if (query.to) conditions.push(lte(sale_schema.created_at, query.to));
	if (query.min_price !== undefined) conditions.push(gte(sale_schema.total, query.min_price));
	if (query.max_price !== undefined) conditions.push(lte(sale_schema.total, query.max_price));

	return and(...conditions);
};

export const sale_repository = {
	find_all: async (query: ReadSaleDto) => {
		return await db.query.sale_schema.findMany({
			with: {
				customer: { with: { profile: true } },
				product_details: {
					with: { product: true },
				},
				appointment_details: {
					with: { appointment: { with: { treatment: true } } },
				},
			},
			orderBy: {
				...(query.sort_by && { [query.sort_by]: query.order }),
			},
			limit: query.limit,
			offset: query.offset,
			where: build_where_query(query),
		});
	},

	count: async (query: ReadSaleDto) => {
		const where_conditions = build_where(query);

		if (query.search) {
			const search_formatted = `%${query.search}%`;
			const [result] = await db
				.select({ total: count() })
				.from(sale_schema)
				.innerJoin(customer_schema, eq(sale_schema.customer_id, customer_schema.id))
				.innerJoin(profile_schema, eq(customer_schema.profile_id, profile_schema.id))
				.where(
					and(
						where_conditions,
						or(
							like(profile_schema.first_name, search_formatted),
							like(profile_schema.last_name, search_formatted),
						),
					),
				);
			return result?.total ?? 0;
		}

		const [result] = await db.select({ total: count() }).from(sale_schema).where(where_conditions);
		return result?.total ?? 0;
	},

	find_one: async (id: number, tx?: DbTransaction) => {
		const database = tx || db;
		return await database.query.sale_schema.findFirst({
			with: {
				customer: { with: { profile: true } },
				product_details: {
					with: { product: true },
				},
				appointment_details: {
					with: { appointment: { with: { treatment: true } } },
				},
			},
			where: { id: { eq: id } },
		});
	},

	create: async (data: sale_insert, tx?: DbTransaction) => {
		const database = tx || db;
		const [result] = await database.insert(sale_schema).values(data).$returningId();
		return result;
	},

	create_product_details: async (data: sale_product_detail_insert[], tx?: DbTransaction) => {
		const database = tx || db;
		if (!data.length) return null;
		return await database.insert(sale_product_detail_schema).values(data).execute();
	},

	create_appointment_details: async (data: sale_appointment_detail_insert[], tx?: DbTransaction) => {
		const database = tx || db;
		if (!data.length) return null;
		return await database.insert(sale_appointment_detail_schema).values(data).execute();
	},

	update: async (id: number, data: Partial<sale_insert>, tx?: DbTransaction) => {
		const database = tx || db;
		const [result] = await database
			.update(sale_schema)
			.set(data)
			.where(eq(sale_schema.id, id))
			.execute();
		return result;
	},

	delete_product_details: async (sale_id: number, tx?: DbTransaction) => {
		const database = tx || db;
		return await database
			.delete(sale_product_detail_schema)
			.where(eq(sale_product_detail_schema.sale_id, sale_id))
			.execute();
	},

	delete_appointment_details: async (sale_id: number, tx?: DbTransaction) => {
		const database = tx || db;
		return await database
			.delete(sale_appointment_detail_schema)
			.where(eq(sale_appointment_detail_schema.sale_id, sale_id))
			.execute();
	},
};
