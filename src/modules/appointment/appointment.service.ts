import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import { appointment_hours } from "./appointment_hours";
import type {
	CreateAppointmentDto,
	ReadAppointmentDto,
	ToggleDisabledAppointmentDto,
	UpdateAppointmentDto,
} from "./appointment.dto";
import { appointment_repository } from "./appointment.repository";
import { treatment_repository } from "../treatment/treatment.repository";
import { customer_repository } from "../customer/customer.repository";

const time_to_minutes = (time: string) => {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
};

const is_weekend = (date: Date) => {
	const day = date.getDay();
	return day === 0 || day === 6;
};

const get_working_hours = (date: Date) => {
	return is_weekend(date) ? appointment_hours.weekend : appointment_hours.weekday;
};

const validate_business_hours = (date: Date, time: string, duration: number) => {
	const schedule = get_working_hours(date);
	const start = time_to_minutes(time);
	const end = start + duration;

	if (start < time_to_minutes(schedule.start) || end > time_to_minutes(schedule.end)) {
		throw new ServerError(error_messages.appointment_outside_hours, 400);
	}
};

const validate_related_records = async (customer_id: number, treatment_id: number) => {
	const [customer, treatment] = await Promise.all([
		customer_repository.find_one(customer_id),
		treatment_repository.find_one(treatment_id),
	]);

	if (!customer) throw new ServerError(error_messages.customer_not_found, 404);
	if (!treatment) throw new ServerError(error_messages.treatment_not_found, 404);

	return { customer, treatment };
};

const to_date = (value: string | Date) => {
	return value instanceof Date ? value : new Date(value);
};

const format_date = (date: Date) => {
	return date.toISOString().slice(0, 10);
};

const validate_conflicts = async (appointment_id: number | null, date: Date, time: string, duration: number) => {
	const appointments = await appointment_repository.find_by_date(format_date(date));
	const start = time_to_minutes(time);
	const end = start + duration;

	const has_conflict = appointments.some((appointment) => {
		if (appointment_id && appointment.id === appointment_id) return false;
		if (!appointment.treatment) return false;
		const existing_start = time_to_minutes(appointment.time_start);
		const existing_end = time_to_minutes(appointment.time_end);
		return start < existing_end && end > existing_start;
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
	const { treatment } = await validate_related_records(data.customer_id, data.treatment_id);
	const appointment_date = to_date(data.date);
	validate_business_hours(appointment_date, data.time, treatment.duration);
	await validate_conflicts(appointment_id, appointment_date, data.time, treatment.duration);
};

const build_appointment_payload = (
	current: { customer_id: number; treatment_id: number; date: string; time_start: string },
	data: UpdateAppointmentDto
) => {
	return {
		customer_id: data.customer_id ?? current.customer_id,
		treatment_id: data.treatment_id ?? current.treatment_id,
		date: data.date ?? current.date,
		time: data.time ?? current.time_start,
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
		await validate_appointment(null, data);
		const result = await appointment_repository.create(data);
		if (!result) throw new ServerError(error_messages.create_failed, 500);
		return await appointment_service.find_one(result.id);
	},

	update: async (id: number, data: UpdateAppointmentDto) => {
		const has_updates = Object.keys(data).length > 0;
		if (!has_updates) throw new ServerError(error_messages.nothing_to_update, 400);

		const current_appointment = await appointment_repository.find_one(id);
		if (!current_appointment) throw new ServerError(error_messages.appointment_not_found, 404);

		const next_appointment = build_appointment_payload(current_appointment, data);
		await validate_appointment(id, next_appointment);

		const result = await appointment_repository.update(id, data);
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