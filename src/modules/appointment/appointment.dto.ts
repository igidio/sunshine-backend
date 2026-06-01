import z from "zod";
import { PaginationTypeSchema } from "~/helpers/types";

const appointment_time_schema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
	message: "La hora proporcionada no es válida. Usa el formato HH:MM:SS.",
});

export const ReadAppointmentDtoSchema = PaginationTypeSchema.extend({
	limit: z.coerce.number().optional().default(50),
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
	customer_id: z.coerce.number().int().positive().optional(),
	treatment_id: z.coerce.number().int().positive().optional(),
});

export type ReadAppointmentDto = z.infer<typeof ReadAppointmentDtoSchema>;

export const CreateAppointmentDtoSchema = z.object({
	customer_id: z.coerce.number().int().positive(),
	treatment_id: z.coerce.number().int().positive(),
	date: z.coerce.date().transform((val) => val.toISOString().split('T')[0]!).default(() => new Date().toISOString().split('T')[0]!),
	time: appointment_time_schema,
	notes: z.string().max(2000).nullable().optional(),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentDtoSchema>;

export const UpdateAppointmentDtoSchema = CreateAppointmentDtoSchema.partial();
export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentDtoSchema>;

export const ToggleDisabledAppointmentDtoSchema = z.object({
	disabled: z.boolean().optional(),
});
export type ToggleDisabledAppointmentDto = z.infer<typeof ToggleDisabledAppointmentDtoSchema>;