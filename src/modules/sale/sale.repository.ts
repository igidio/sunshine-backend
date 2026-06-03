import db from "~/database";
import type { ReadSaleDto } from "./sale.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, inArray, type SQL } from "drizzle-orm";
import { sale_schema, sale_product_detail_schema, sale_appointment_detail_schema, type sale_insert, type sale_product_detail_insert, type sale_appointment_detail_insert } from "./sale.schema";

type SaleWhereConfig = ModelWhere<"sale_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const build_where_query = (query: ReadSaleDto): SaleWhereConfig => {
	return {
		...(query.customer_id && { customer_id: { eq: query.customer_id } }),
		...(query.ids && query.ids.length > 0 && { id: { inArray: query.ids } }),
	};
};

const build_where = (query: ReadSaleDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	if (query.customer_id) conditions.push(eq(sale_schema.customer_id, query.customer_id));
	if (query.ids && query.ids.length > 0) conditions.push(inArray(sale_schema.id, query.ids));

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
				treatment_details: {
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
		const [result] = await db.select({ total: count() }).from(sale_schema).where(build_where(query));
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
				treatment_details: {
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
