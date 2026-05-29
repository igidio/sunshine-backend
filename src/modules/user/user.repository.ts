import db from "~/database"
import { user_schema, type user_insert } from "./user.schema"
import type { MySql2Database } from "drizzle-orm/mysql2";
import { and, count, eq, getColumns, isNull, like, or, type SQL } from "drizzle-orm";
import type { ReadUserDto } from "./user.dto";
import type { ModelWhere } from "~/helpers/types";

type UserWhereConfig = ModelWhere<"user_schema">;

const build_where_query = (pagination: ReadUserDto): UserWhereConfig => {
	return {
		...(pagination.role && { role: { eq: pagination.role } }),
		...(pagination.search && {
			OR: [
				{ username: { like: `%${pagination.search}%` } },
				{ email: { like: `%${pagination.search}%` } }
			]
		}),
	};
};

const build_where = (pagination: ReadUserDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	if (pagination.role) conditions.push(eq(user_schema.role, pagination.role));
	
	if (pagination.search) {
		const searchFormatted = `%${pagination.search}%`;
		conditions.push(
			or(
				like(user_schema.username, searchFormatted),
				like(user_schema.email, searchFormatted)
			)
		);
	}

	return and(...conditions);
};

export const user_repository = {
	create: async (body: user_insert, tx?: MySql2Database) => {
		const database = tx || db;
		return await database.insert(user_schema).values(body);
	},
	select_one: async (id: number) => {
		const { password, ...columns } = getColumns(user_schema);
		const user = await db.select(columns).from(user_schema).where(eq(user_schema.id, id));
		return user[0];
	},
	select_one_by_username_or_email: async (email_or_username: string) => {
		const results = await db.select().from(user_schema).where(
			or(eq(user_schema.email, email_or_username), eq(user_schema.username, email_or_username))
		).limit(1)
		return results[0]
	},
	find_all: async (pagination: ReadUserDto) => {
		const { password, ...columns } = getColumns(user_schema);
		return await db.query.user_schema.findMany({
			columns: {
				password: false,
			},
			orderBy: {
				...(pagination.sort_by && { [pagination.sort_by]: pagination.order }),
			},
			limit: pagination.limit,
			offset: pagination.offset,
			with: {
				profile: true,
			},
			where: build_where_query(pagination),
		});
	},
	count: async (pagination: ReadUserDto) => {
		const [result] = await db
			.select({ total: count() })
			.from(user_schema)
			.where(build_where(pagination));
		return result!.total;
	},
	find_one: async (id: number, tx?: MySql2Database) => {
		const database = tx || db;
		const { password, ...columns } = getColumns(user_schema);
		const user = await database.select(columns).from(user_schema).where(eq(user_schema.id, id));
		return user[0];
	},
	update: async (id: number, data: Partial<user_insert>, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(user_schema)
			.set(data)
			.where(eq(user_schema.id, id))
			.execute();
		return result;
	},
	toggle_disabled: async (id: number, disabled_at: Date | null, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(user_schema)
			.set({ disabled_at })
			.where(eq(user_schema.id, id))
			.execute();
		return result;
	},
	set_permissions: async (id: number, permissions: string, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(user_schema)
			.set({ permissions })
			.where(eq(user_schema.id, id))
			.execute();
		return result;
	}
}