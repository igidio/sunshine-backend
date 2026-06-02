import { appointment_schema, type appointment_insert } from "~/modules/appointment/appointment.schema";

const data: appointment_insert[] = [
	{ customer_id: 1, treatment_id: 1, date: "2026-05-01", time_start: "10:00:00", time_end: "10:30:00", notes: "Corte de cabello" },
	{ customer_id: 2, treatment_id: 6, date: "2026-05-02", time_start: "13:00:00", time_end: "14:30:00", notes: "Masaje relajante" },
	{ customer_id: 3, treatment_id: 9, date: "2026-05-03", time_start: "09:00:00", time_end: "10:00:00", notes: "Hidratación capilar" },
	{ customer_id: 4, treatment_id: 7, date: "2026-05-03", time_start: "11:00:00", time_end: "11:50:00", notes: "Limpieza facial" },
	{ customer_id: 5, treatment_id: 3, date: "2026-05-04", time_start: "10:00:00", time_end: "10:45:00", notes: "Manicura" },
	{ customer_id: 1, treatment_id: 4, date: "2026-04-28", time_start: "10:45:00", time_end: "11:45:00", notes: "Pedicura" },
	{ customer_id: 2, treatment_id: 10, date: "2026-04-29", time_start: "14:45:00", time_end: "15:55:00", notes: "Maquillaje profesional" },
	{ customer_id: 4, treatment_id: 8, date: "2026-05-03", time_start: "12:00:00", time_end: "13:00:00", notes: "Tratamiento antiacné" },
	{ customer_id: 3, treatment_id: 5, date: "2026-04-30", time_start: "16:00:00", time_end: "16:20:00", notes: "Depilación de cejas" },
	{ customer_id: 6, treatment_id: 10, date: "2026-05-05", time_start: "14:00:00", time_end: "15:10:00", notes: "Maquillaje profesional" },
	{ customer_id: 5, treatment_id: 11, date: "2026-05-01", time_start: "09:00:00", time_end: "09:20:00", notes: "Bronceado spray" },
	{ customer_id: 9, treatment_id: 12, date: "2026-05-08", time_start: "10:00:00", time_end: "10:40:00", notes: "Exfoliación corporal" },
	{ customer_id: 6, treatment_id: 13, date: "2026-05-02", time_start: "11:00:00", time_end: "12:00:00", notes: "Envoltura corporal" },
	{ customer_id: 7, treatment_id: 14, date: "2026-05-06", time_start: "13:00:00", time_end: "13:45:00", notes: "Microdermoabrasión" },
	{ customer_id: 8, treatment_id: 15, date: "2026-05-07", time_start: "11:00:00", time_end: "11:30:00", notes: "Peeling químico" },
	{ customer_id: 10, treatment_id: 16, date: "2026-05-08", time_start: "15:00:00", time_end: "16:15:00", notes: "Extensiones de pestañas" },
	{ customer_id: 7, treatment_id: 1, date: "2026-05-04", time_start: "10:00:00", time_end: "10:30:00", notes: "Corte de cabello" },
	{ customer_id: 8, treatment_id: 2, date: "2026-05-05", time_start: "14:00:00", time_end: "16:00:00", notes: "Tinte completo" },
	{ customer_id: 9, treatment_id: 4, date: "2026-05-06", time_start: "09:00:00", time_end: "10:00:00", notes: "Pedicura" },
	{ customer_id: 10, treatment_id: 6, date: "2026-05-07", time_start: "16:00:00", time_end: "17:30:00", notes: "Masaje relajante" },
];

export default {
	data,
	type: appointment_schema,
}