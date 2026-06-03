import db from "~/database";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, gte, inArray, isNull, lte, type SQL } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import type { ReadAppointmentDto } from "./appointment.dto";
import { appointment_schema, type appointment_insert } from "./appointment.schema";

type AppointmentWhereConfig = ModelWhere<"appointment_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type AppointmentWriteData = Omit<appointment_insert, "id" | "created_at" | "updated_at">;

const format_date = (date: Date) => date.toISOString().slice(0, 10);

const build_where_query = (query: ReadAppointmentDto): AppointmentWhereConfig => {
	return {
		deleted_at: { isNull: true },
		...(query.customer_id && { customer_id: { eq: query.customer_id } }),
		...(query.treatment_id && { treatment_id: { eq: query.treatment_id } }),
		...((query.from || query.to) && {
			date: {
				...(query.from && { gte: format_date(query.from) }),
				...(query.to && { lte: format_date(query.to) }),
			},
		}),
		...(query.ids && query.ids.length > 0 && { id: { in: query.ids } }),
	};
};

const build_where = (query: ReadAppointmentDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(isNull(appointment_schema.deleted_at));
	if (query.customer_id) conditions.push(eq(appointment_schema.customer_id, query.customer_id));
	if (query.treatment_id) conditions.push(eq(appointment_schema.treatment_id, query.treatment_id));
	if (query.from) conditions.push(gte(appointment_schema.date, format_date(query.from)));
	if (query.to) conditions.push(lte(appointment_schema.date, format_date(query.to)));
	if (query.ids && query.ids.length > 0) conditions.push(inArray(appointment_schema.id, query.ids));

	return and(...conditions);
};

export const appointment_repository = {
	find_all: async (query: ReadAppointmentDto) => {
		return await db.query.appointment_schema.findMany({
			columns: { deleted_at: false },
			with: {
				customer: { with: { profile: true } },
				treatment: true,
			},
			orderBy: { date: "asc", time_start: "asc" },
			limit: query.limit,
			offset: query.offset,
			where: build_where_query(query),
		});
	},

	count: async (query: ReadAppointmentDto) => {
		const [result] = await db.select({ total: count() }).from(appointment_schema).where(build_where(query));
		return result?.total ?? 0;
	},

	find_one: async (id: number, tx?: DbTransaction) => {
		const database = tx || db;
		return await database.query.appointment_schema.findFirst({
			with: { customer: true, treatment: true },
			where: {
				id: { eq: id },
				deleted_at: { isNull: true },
			},
		});
	},

	find_by_date: async (date: string, tx?: DbTransaction) => {
		const database = tx || db;
		return await database.query.appointment_schema.findMany({
			with: {
				treatment: { columns: { duration: true } },
			},
			where: {
				date: { eq: date },
				deleted_at: { isNull: true },
				disabled_at: { isNull: true },
			},
		});
	},

	create: async (data: AppointmentWriteData, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database.insert(appointment_schema).values(data).$returningId();
		return result;
	},

	update: async (id: number, data: AppointmentWriteData, tx?: MySql2Database) => {
		const database = tx || db;
		const [result] = await database
			.update(appointment_schema)
			.set(data)
			.where(and(eq(appointment_schema.id, id), isNull(appointment_schema.deleted_at)))
			.execute();
		return result;
	},

	delete: async (id: number, tx?: MySql2Database) => {
		const database = tx || db;
		return await database
			.update(appointment_schema)
			.set({ deleted_at: new Date() })
			.where(and(eq(appointment_schema.id, id), isNull(appointment_schema.deleted_at)))
			.execute();
	},

	toggle_disabled: async (id: number, disabled_at: Date | null, tx?: MySql2Database) => {
		const database = tx || db;
		return await database
			.update(appointment_schema)
			.set({ disabled_at })
			.where(and(eq(appointment_schema.id, id), isNull(appointment_schema.deleted_at)))
			.execute();
	},
};