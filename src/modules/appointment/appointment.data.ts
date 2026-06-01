import { DateTime } from "luxon";



export type AppointmentDaySchedule = {
	day: number;
	label: string;
	attention: {
		start: string;
		end: string;
	}[];
};

export const appointment_time_format = "HH:mm:ss" as const;

export const appointment_days = [
	{
		day: 1,
		label: "lunes",
		attention: [{ start: "09:00:00", end: "18:00:00" }],
	},
	{
		day: 2,
		label: "martes",
		attention: [{ start: "09:00:00", end: "18:00:00" }],
	},
	{
		day: 3,
		label: "miercoles",
		attention: [{ start: "09:00:00", end: "18:00:00" }],
	},
	{
		day: 4,
		label: "jueves",
		attention: [{ start: "09:00:00", end: "18:00:00" }],
	},
	{
		day: 5,
		label: "viernes",
		attention: [{ start: "09:00:00", end: "18:00:00" }],
	},
	{
		day: 6,
		label: "sabado",
		attention: [{ start: "10:00:00", end: "14:00:00" }],
	},
] as const satisfies readonly AppointmentDaySchedule[];

export const get_appointment_day_schedule = (date: string | Date | DateTime) => {
	const current_date = DateTime.isDateTime(date)
		? date
		: date instanceof Date
			? DateTime.fromJSDate(date)
			: DateTime.fromISO(date);

	return appointment_days.find((item) => item.day === current_date.weekday);
};