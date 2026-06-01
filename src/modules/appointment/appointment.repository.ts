import db from "~/database";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { ModelWhere } from "~/helpers/types";
import { and, count, eq, gte, isNull, lte, type SQL } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import type { ReadAppointmentDto } from "./appointment.dto";
import { appointment_schema } from "./appointment.schema";
import { treatment_repository } from "../treatment/treatment.repository";

type AppointmentWhereConfig = ModelWhere<"appointment_schema">;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type AppointmentWriteData = {
	customer_id: number;
	treatment_id: number;
	date: string;
	notes?: string | null;
	disabled_at?: Date | null;
	time?: string;
	time_start?: string;
	time_end?: string;
};

const to_date = (value: string) => {
	return new Date(value);
};

const format_date = (date: Date) => {
	return date.toISOString().slice(0, 10);
};

const time_to_minutes = (time: string) => {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
};

const minutes_to_time = (minutes_total: number) => {
	const hours = Math.floor(minutes_total / 60);
	const minutes = minutes_total % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const is_weekend = (date: Date) => {
	const day = date.getDay();
	return day === 0 || day === 6;
};

const get_working_hours = (date: Date) => {
	return is_weekend(date)
		? { start: "10:00", end: "14:00" }
		: { start: "09:00", end: "18:00" };
};

const validate_time_end = (date: Date, time_start: string, time_end: string) => {
	const schedule = get_working_hours(date);
	if (
		time_to_minutes(time_start) < time_to_minutes(schedule.start)
		|| time_to_minutes(time_end) > time_to_minutes(schedule.end)
	) {
		throw new ServerError(error_messages.appointment_outside_hours, 400);
	}
};

const build_times = async (data: AppointmentWriteData) => {
	const treatment = await treatment_repository.find_one(data.treatment_id);
	if (!treatment) throw new ServerError(error_messages.treatment_not_found, 404);

	const time_start = data.time_start ?? data.time;
	if (!time_start) throw new ServerError(error_messages.nothing_to_update, 400);

	const time_end = minutes_to_time(time_to_minutes(time_start) + treatment.duration);
	validate_time_end(to_date(data.date), time_start, time_end);

	return { time_start, time_end };
};

const build_where_query = (query: ReadAppointmentDto): AppointmentWhereConfig => {
	return {
		deleted_at: {
			isNull: true,
		},
		...(query.customer_id && {
			customer_id: {
				eq: query.customer_id,
			},
		}),
		...(query.treatment_id && {
			treatment_id: {
				eq: query.treatment_id,
			},
		}),
		...((query.from || query.to) && {
			date: {
				...(query.from && { gte: format_date(query.from) }),
				...(query.to && { lte: format_date(query.to) }),
			},
		}),
	};
};

const build_where = (query: ReadAppointmentDto): SQL | undefined => {
	const conditions: (SQL | undefined)[] = [];

	conditions.push(isNull(appointment_schema.deleted_at));
	if (query.customer_id) conditions.push(eq(appointment_schema.customer_id, query.customer_id));
	if (query.treatment_id) conditions.push(eq(appointment_schema.treatment_id, query.treatment_id));
	if (query.from) conditions.push(gte(appointment_schema.date, format_date(query.from)));
	if (query.to) conditions.push(lte(appointment_schema.date, format_date(query.to)));

	return and(...conditions);
};

export const appointment_repository = {
	find_all: async (query: ReadAppointmentDto) => {
		return await db.query.appointment_schema.findMany({
			columns: {
				deleted_at: false,
			},
			with: {
				customer: {
					with: {
						profile: true,
					}
				},
				treatment: true,
			},
			orderBy: {
				date: "asc",
				time_start: "asc",
			},
			limit: query.limit,
			offset: query.offset,
			where: build_where_query(query),
		});
	},

	count: async (query: ReadAppointmentDto) => {
		const [result] = await db
			.select({ total: count() })
			.from(appointment_schema)
			.where(build_where(query));

		return result?.total ?? 0;
	},

	find_one: async (id: number, tx?: DbTransaction) => {
		const database = tx || db;
		return await database.query.appointment_schema.findFirst({
			with: {
				customer: true,
				treatment: true,
			},
			where: {
				id: {
					eq: id,
				},
				deleted_at: {
					isNull: true,
				},
			},
		});
	},

	find_by_date: async (date: string, tx?: DbTransaction) => {
		const database = tx || db;
		return await database.query.appointment_schema.findMany({
			with: {
				treatment: {
					columns: {
						duration: true,
					},
				},
			},
			where: {
				date: {
					eq: date,
				},
				deleted_at: {
					isNull: true,
				},
				disabled_at: {
					isNull: true,
				},
			},
		});
	},

	create: async (data: AppointmentWriteData, tx?: MySql2Database) => {
		const database = tx || db;
		const times = await build_times(data);
		const [result] = await database.insert(appointment_schema).values({
			customer_id: data.customer_id,
			treatment_id: data.treatment_id,
			date: data.date,
			notes: data.notes,
			disabled_at: data.disabled_at,
			...times,
		}).$returningId();
		return result;
	},

	update: async (id: number, data: Partial<AppointmentWriteData>, tx?: MySql2Database) => {
		const database = tx || db;
		const query_runner = (tx ?? db) as typeof db;
		const current = await query_runner.query.appointment_schema.findFirst({
			where: {
				id: { eq: id },
				deleted_at: { isNull: true },
			},
		});

		if (!current) return null;

		const next_values: AppointmentWriteData = {
			customer_id: data.customer_id ?? current.customer_id,
			treatment_id: data.treatment_id ?? current.treatment_id,
			date: data.date ?? current.date,
			notes: data.notes ?? current.notes,
			disabled_at: data.disabled_at ?? current.disabled_at,
			time: data.time,
			time_start: data.time_start ?? current.time_start,
			time_end: data.time_end,
		};

		const times = await build_times(next_values);
		const [result] = await database
			.update(appointment_schema)
			.set({
				customer_id: next_values.customer_id,
				treatment_id: next_values.treatment_id,
				date: next_values.date,
				notes: next_values.notes,
				disabled_at: next_values.disabled_at,
				...times,
			})
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