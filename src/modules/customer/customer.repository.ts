import db from "~/database"
import type { ReadCustomerDto } from "./customer.dto";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, inArray, isNotNull, isNull, like, or, type SQL } from "drizzle-orm";
import { customer_schema, type customer_insert } from "./customer.schema";
import { profile_schema } from "~/modules/profile/profile.schema";

type CustomerWhereConfig = ModelWhere<'customer_schema'>;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const build_where_query = (pagination: ReadCustomerDto): CustomerWhereConfig => {
	return {
		...(pagination.status === 'active' && { disabled_at: { isNull: true } }),
		...(pagination.status === 'inactive' && { disabled_at: { isNotNull: true } }),
		...(pagination.search && {
			profile: {
				OR: [
					{ first_name: { like: `%${pagination.search}%` } },
					{ last_name: { like: `%${pagination.search}%` } },
					{ address: { like: `%${pagination.search}%` } },
				]
			}
		})
	};
};

const build_where = (pagination: ReadCustomerDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	if (pagination.status === 'active') {
		conditions.push(isNull(customer_schema.disabled_at));
	} else if (pagination.status === 'inactive') {
		conditions.push(isNotNull(customer_schema.disabled_at));
	}

	if (pagination.search) {
		conditions.push(
			or(
				like(profile_schema.first_name, `%${pagination.search}%`),
				like(profile_schema.last_name, `%${pagination.search}%`),
				like(profile_schema.address, `%${pagination.search}%`),
			)
		);
	}

	return and(...conditions);
};

export const customer_repository = {
	find_all: async (pagination: ReadCustomerDto) => {
		const result = await db.query.customer_schema.findMany({
			orderBy: {
				...pagination.sort_by && { [pagination.sort_by]: pagination.order },
			},
			with: {
				profile: true,
			},
			limit: pagination.limit,
			offset: pagination.offset,
			where: build_where_query(pagination)
		})

		return result;
	},

	count: async (pagination: ReadCustomerDto) => {
		const result = await db
			.select({ value: count(customer_schema.id) })
			.from(customer_schema)
			.innerJoin(profile_schema, eq(customer_schema.profile_id, profile_schema.id))
			.where(build_where(pagination));
		return result[0]?.value || 0;
	},

	find_one: async (id: number) => {
		const result = await db.query.customer_schema.findFirst({
			where: {
				id: {
					eq: id
				}
			},
			with: {
				profile: true
			}
		});
		return result;
	},

	create: async (body: customer_insert, tx?: DbTransaction) => {
		const runner = tx || db;
		return await runner.insert(customer_schema).values(body).$returningId();
	},

	toggle_disable: async (id: number) => {
		const customer = await customer_repository.find_one(id);
		if (!customer) return;
		await db.update(customer_schema)
			.set({
				disabled_at: customer.disabled_at ? null : new Date()
			})
			.where(eq(customer_schema.id, id));
	},

	delete: async (id: number) => {
		return await db.delete(customer_schema).where(eq(customer_schema.id, id));
	}
}