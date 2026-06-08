import db from "~/database"
import { user_schema, type user_insert } from "./user.schema"
import type { MySql2Database } from "drizzle-orm/mysql2";
import { and, count, eq, getColumns, isNull, like, or, type SQL } from "drizzle-orm";
import type { ReadUserDto } from "./user.dto";
import type { ModelWhere } from "~/helpers/types";

type UserWhereConfig = ModelWhere<"user_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const build_where_query = (pagination: ReadUserDto): UserWhereConfig => {
	return {
		...(pagination.status === 'active' && { disabled_at: { isNull: true } }),
		...(pagination.status === 'inactive' && { disabled_at: { isNotNull: true } }),
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

	find_one: async ({ id, username, email }: { id?: number, username?: string, email?: string }, tx?: DbTransaction, exclude_password: boolean = true) => {
		const database = tx || db;
		const user = await database.query.user_schema.findFirst({
			...(exclude_password ? { columns: { password: false } } : {}),
			where: {
				OR: [
					{
						id: { eq: id },
					},
					{
						username: { eq: username },
					},
					{
						email: { eq: email },
					},
				]
			}
		});
		return user;
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
	},

	set_chat_access: async (id: number, chat_access: string, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(user_schema)
			.set({ chat_access })
			.where(eq(user_schema.id, id))
			.execute();
		return result;
	}
}