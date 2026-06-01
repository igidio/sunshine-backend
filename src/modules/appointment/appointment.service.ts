import { DateTime } from "luxon";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import { appointment_time_format, get_appointment_day_schedule } from "./appointment.data";
import { appointment_repository } from "./appointment.repository";
import type { CreateAppointmentDto, ReadAppointmentDto, ToggleDisabledAppointmentDto, UpdateAppointmentDto } from "./appointment.dto";
import type { appointment_insert } from "./appointment.schema";
import { customer_service } from "../customer/customer.service";
import { treatment_service } from "../treatment/treatment.service";

type AppointmentWriteData = Omit<appointment_insert, "id" | "created_at" | "updated_at">;

type AppointmentRecord = {
	id: number;
	customer_id: number;
	treatment_id: number;
	date: string;
	time_start: string;
	time_end: string;
	notes: string | null;
	disabled_at: Date | null;
	treatment?: {
		duration: number;
	} | null;
};

const to_date_time = (value: string | Date) => {
	const date_time = typeof value === "string" ? DateTime.fromISO(value) : DateTime.fromJSDate(value);
	if (!date_time.isValid) throw new ServerError(error_messages.invalid_date, 400);
	return date_time;
};

const format_date = (value: string | Date) => {
	const formatted_date = to_date_time(value).toISODate();
	if (!formatted_date) throw new ServerError(error_messages.invalid_date, 400);
	return formatted_date;
};

const time_to_seconds = (time: string) => {
	const parsed_time = DateTime.fromFormat(time, appointment_time_format);
	if (!parsed_time.isValid) throw new ServerError(error_messages.invalid_date, 400);
	return parsed_time.hour * 3600 + parsed_time.minute * 60 + parsed_time.second;
};

const seconds_to_time = (seconds_total: number) => {
	const hours = Math.floor(seconds_total / 3600);
	const minutes = Math.floor((seconds_total % 3600) / 60);
	const seconds = seconds_total % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const validate_business_hours = (date: DateTime, time: string, duration: number) => {
	const schedule = get_appointment_day_schedule(date);
	if (!schedule) {
		throw new ServerError(error_messages.appointment_outside_hours, 400);
	}

	const start_seconds = time_to_seconds(time);
	const end_seconds = start_seconds + duration * 60;
	const is_inside_attention = schedule.attention.some((attention) => {
		const attention_start = time_to_seconds(attention.start);
		const attention_end = time_to_seconds(attention.end);
		return start_seconds >= attention_start && end_seconds <= attention_end;
	});

	if (!is_inside_attention) {
		throw new ServerError(error_messages.appointment_outside_hours, 400);
	}
};

const validate_conflicts = async (appointment_id: number | null, date: DateTime, time: string, duration: number) => {
	const appointments = await appointment_repository.find_by_date(format_date(date.toJSDate()));
	const start_seconds = time_to_seconds(time);
	const end_seconds = start_seconds + duration * 60;

	const has_conflict = appointments.some((appointment) => {
		if (appointment_id && appointment.id === appointment_id) return false;
		if (!appointment.treatment) return false;

		const existing_start = time_to_seconds(appointment.time_start);
		const existing_end = time_to_seconds(appointment.time_end);
		return start_seconds < existing_end && end_seconds > existing_start;
	});

	if (has_conflict) {
		throw new ServerError(error_messages.appointment_conflict, 400);
	}
};

const validate_appointment = async (
	appointment_id: number | null,
	data: {
		customer_id: number;
		treatment_id: number;
		date: string | Date;
		time: string;
	}
) => {
	await customer_service.find_one(data.customer_id);
	const treatment = await treatment_service.find_one(data.treatment_id);
	const appointment_date = to_date_time(data.date);

	validate_business_hours(appointment_date, data.time, treatment.duration);
	await validate_conflicts(appointment_id, appointment_date, data.time, treatment.duration);

	return {
		date: format_date(appointment_date.toJSDate()),
		treatment,
	};
};

const build_insert_payload = (data: CreateAppointmentDto, date: string, duration: number): AppointmentWriteData => {
	const time_start = data.time;
	const time_end = seconds_to_time(time_to_seconds(time_start) + duration * 60);

	return {
		customer_id: data.customer_id,
		treatment_id: data.treatment_id,
		date,
		time_start,
		time_end,
		notes: data.notes ?? null,
		disabled_at: null,
	};
};

const build_update_payload = (
	current: AppointmentRecord,
	data: UpdateAppointmentDto,
	duration: number
): AppointmentWriteData => {
	const date = data.date ? format_date(data.date) : current.date;
	const time_start = data.time ?? current.time_start;
	const time_end = seconds_to_time(time_to_seconds(time_start) + duration * 60);

	return {
		customer_id: data.customer_id ?? current.customer_id,
		treatment_id: data.treatment_id ?? current.treatment_id,
		date,
		time_start,
		time_end,
		notes: data.notes ?? current.notes,
		disabled_at: current.disabled_at,
	};
};

export const appointment_service = {
	find: async (query: ReadAppointmentDto) => {
		const count = await appointment_repository.count(query);
		const data = await appointment_repository.find_all(query);

		return {
			count,
			data,
			limit: query.limit,
			offset: query.offset,
			is_last_page: query.offset + query.limit >= count,
		};
	},

	find_one: async (id: number) => {
		const appointment = await appointment_repository.find_one(id);
		if (!appointment) throw new ServerError(error_messages.appointment_not_found, 404);
		return appointment;
	},

	create: async (data: CreateAppointmentDto) => {
		const validation = await validate_appointment(null, data);
		const payload = build_insert_payload(data, validation.date, validation.treatment.duration);
		const result = await appointment_repository.create(payload);
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		return await appointment_service.find_one(result.id);
	},

	update: async (id: number, data: UpdateAppointmentDto) => {
		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		const current_appointment = await appointment_repository.find_one(id);
		if (!current_appointment) throw new ServerError(error_messages.appointment_not_found, 404);
		const next_customer_id = data.customer_id ?? current_appointment.customer_id;
		const next_treatment_id = data.treatment_id ?? current_appointment.treatment_id;
		const next_time = data.time ?? current_appointment.time_start;
		const next_date = data.date ?? current_appointment.date;

		const validation = await validate_appointment(id, {
			customer_id: next_customer_id,
			treatment_id: next_treatment_id,
			date: next_date,
			time: next_time,
		});
		const payload = build_update_payload(current_appointment, data, validation.treatment.duration);

		const result = await appointment_repository.update(id, payload);
		if (!result || result.affectedRows === 0) {
			throw new ServerError(error_messages.nothing_to_update, 400);
		}

		return await appointment_service.find_one(id);
	},

	delete: async (id: number) => {
		const current_appointment = await appointment_repository.find_one(id);
		if (!current_appointment) throw new ServerError(error_messages.appointment_not_found, 404);
		await appointment_repository.delete(id);
		return { success: true };
	},

	toggle_disabled: async (id: number, data?: ToggleDisabledAppointmentDto) => {
		const current_appointment = await appointment_repository.find_one(id);
		if (!current_appointment) throw new ServerError(error_messages.appointment_not_found, 404);
		const target_disabled_at = typeof data?.disabled === "boolean"
			? (data.disabled ? new Date() : null)
			: (current_appointment.disabled_at ? null : new Date());

		await appointment_repository.toggle_disabled(id, target_disabled_at);
		return await appointment_service.find_one(id);
	},
};