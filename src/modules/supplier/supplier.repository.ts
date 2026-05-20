import db from "~/database"
import { supplier_schema, type supplier_insert } from "./supplier.schema";
import type { ReadSupplierDto } from "./supplier.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, isNotNull, isNull, like, or, SQL } from "drizzle-orm";

type SupplierWhereConfig = ModelWhere<'supplier_schema'>;

const build_where_query = (pagination: ReadSupplierDto): SupplierWhereConfig => {
	return {
		deleted_at: {
			isNull: true
		},
		...(pagination.status === 'active' && { disabled_at: { isNull: true } }),
		...(pagination.status === 'inactive' && { disabled_at: { isNotNull: true } }),
		...(pagination.search && {
			OR: [
				{ name: { like: `%${pagination.search}%` } },
				{ email: { like: `%${pagination.search}%` } },
				{ phone_number: { like: `%${pagination.search}%` } },
				{ address: { like: `%${pagination.search}%` } },
				{ description: { like: `%${pagination.search}%` } },
			]
		})
	};
};

const build_where = (pagination: ReadSupplierDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];
	conditions.push(isNull(supplier_schema.deleted_at));
	if (pagination.status === 'active') {
		conditions.push(isNull(supplier_schema.disabled_at));
	} else if (pagination.status === 'inactive') {
		conditions.push(isNotNull(supplier_schema.disabled_at));
	}
	if (pagination.search) {
		const searchFormated = `%${pagination.search}%`;
		conditions.push(
			or(
				like(supplier_schema.name, searchFormated),
				like(supplier_schema.email, searchFormated),
				like(supplier_schema.phone_number, searchFormated),
				like(supplier_schema.address, searchFormated),
				like(supplier_schema.description, searchFormated)
			)
		);
	}
	return and(...conditions);
};

export const supplier_repository = {

	find_all: async (pagination: ReadSupplierDto) => {
		return await db.query.supplier_schema.findMany({
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
		const result = await db.query.supplier_schema.findFirst({
			where: {
				id
			}
		});
		return result;
	},

	count: async (pagination: ReadSupplierDto) => {
		const [result] = await db.select({ total: count() })
			.from(supplier_schema)
			.where(build_where(pagination));
		return result!.total;
	},

	create: async (data: supplier_insert) => {
		const [result] = await db.insert(supplier_schema).values(data).$returningId();
		return result;
	},


	update: async (id: number, data: Partial<supplier_insert>) => {		
		const [result] = await db
			.update(supplier_schema)
			.set(data)
			.where(and(eq(supplier_schema.id, id), isNull(supplier_schema.deleted_at)))
			.execute();
		return result;
	},

	delete: async (id: number) => {
		return await db
			.update(supplier_schema)
			.set({ deleted_at: new Date() })
			.where(and(eq(supplier_schema.id, id), isNull(supplier_schema.deleted_at)))
			.execute();
	},

	toggle_disable: async (id: number, disable: boolean) => {
		return await db
			.update(supplier_schema)
			.set({ disabled_at: disable ? new Date() : null })
			.where(and(eq(supplier_schema.id, id), isNull(supplier_schema.deleted_at)))
			.execute();
	}
}