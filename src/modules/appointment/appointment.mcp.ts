import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { appointment_service } from "~/modules/appointment/appointment.service";
import { PaginationTypeSchema, BooleanPreprocess, IdsSchema } from "~/helpers/types";

const appointment_time_schema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
	message: "La hora proporcionada no es válida. Usa el formato HH:MM:SS.",
});

const McpReadAppointmentDtoSchema = PaginationTypeSchema.extend({
	limit: z.coerce.number().optional().default(50),
	from: z.string().optional().describe('Fecha de inicio (ISO 8601, ej: 2025-01-01)'),
	to: z.string().optional().describe('Fecha de fin (ISO 8601, ej: 2025-12-31)'),
	customer_id: z.coerce.number().int().positive().optional(),
	treatment_id: z.coerce.number().int().positive().optional(),
	show_attended: BooleanPreprocess.optional(),
	ids: IdsSchema,
});

const McpCreateAppointmentDtoSchema = z.object({
	customer_id: z.number().int().positive().describe('ID del cliente'),
	treatment_id: z.number().int().positive().describe('ID del tratamiento'),
	date: z.string().describe('Fecha de la cita (ISO 8601, ej: 2025-06-18). Por defecto: hoy.'),
	time: appointment_time_schema.describe('Hora de inicio (formato HH:MM:SS, ej: 10:00:00)'),
	notes: z.string().max(2000).nullable().optional().describe('Notas adicionales'),
});

const McpUpdateAppointmentDtoSchema = McpCreateAppointmentDtoSchema.partial();

export const register_appointments_tools = (server: McpServer) => {

	server.registerTool(
		'list_appointments',
		{
			title: 'Listar Citas',
			description:
				'Lista las citas del sistema con paginación, filtros por fecha, cliente, tratamiento y si ya fueron atendidas.',
			inputSchema: McpReadAppointmentDtoSchema,
		},
		async (params) => {
			const result = await appointment_service.find({
				...params,
				from: params.from ? new Date(params.from) : undefined,
				to: params.to ? new Date(params.to) : undefined,
			});
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		},
	);

	server.registerTool(
		'get_appointment',
		{
			title: 'Obtener Cita',
			description: 'Obtiene los detalles completos de una cita por su ID, incluyendo cliente, tratamiento y detalles de venta si ya fue atendida.',
			inputSchema: {
				id: z.number().int().positive().describe('ID de la cita'),
			},
		},
		async ({ id }) => {
			try {
				const appointment = await appointment_service.find_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(appointment, null, 2),
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Error desconocido';
				return {
					content: [{ type: 'text', text: message }],
					isError: true,
				};
			}
		},
	);

	server.registerTool(
		'create_appointment',
		{
			title: 'Crear Cita',
			description:
				'Crea una nueva cita en el sistema. ' +
				'Valida automáticamente que la hora esté dentro del horario de atención, ' +
				'que no haya conflictos con otras citas del mismo día y que el cliente y tratamiento existan.',
			inputSchema: McpCreateAppointmentDtoSchema,
		},
		async (data) => {
			try {
				const appointment = await appointment_service.create(data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(appointment, null, 2),
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Error desconocido';
				return {
					content: [{ type: 'text', text: message }],
					isError: true,
				};
			}
		},
	);

	server.registerTool(
		'update_appointment',
		{
			title: 'Actualizar Cita',
			description:
				'Actualiza los datos de una cita existente. ' +
				'Revalida horarios y conflictos. No se puede modificar una cita que ya fue atendida (vendida).',
			inputSchema: McpUpdateAppointmentDtoSchema.extend({
				id: z.number().int().positive().describe('ID de la cita a actualizar'),
			}),
		},
		async ({ id, ...data }) => {
			try {
				const appointment = await appointment_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(appointment, null, 2),
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Error desconocido';
				return {
					content: [{ type: 'text', text: message }],
					isError: true,
				};
			}
		},
	);

	server.registerTool(
		'delete_appointment',
		{
			title: 'Eliminar Cita',
			description: 'Realiza un borrado lógico (soft delete) de una cita por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID de la cita a eliminar'),
			},
		},
		async ({ id }) => {
			try {
				await appointment_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Cita con ID ${id} eliminada correctamente.`,
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Error desconocido';
				return {
					content: [{ type: 'text', text: message }],
					isError: true,
				};
			}
		},
	);

	server.registerTool(
		'toggle_appointment_status',
		{
			title: 'Activar/Desactivar Cita',
			description: 'Habilita o deshabilita una cita.',
			inputSchema: {
				id: z.number().int().positive().describe('ID de la cita'),
				disabled: z.boolean().optional().describe('true para deshabilitar, false para habilitar. Si no se especifica, alterna el estado.'),
			},
		},
		async ({ id, disabled }) => {
			try {
				await appointment_service.toggle_disabled(id, { disabled } as { disabled?: boolean });
				const accion = disabled ? 'deshabilitada' : 'habilitada';
				return {
					content: [
						{
							type: 'text',
							text: `Cita con ID ${id} ${accion} correctamente.`,
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Error desconocido';
				return {
					content: [{ type: 'text', text: message }],
					isError: true,
				};
			}
		},
	);

	server.registerResource(
		'appointment_detail',
		'appointment://{id}',
		{
			title: 'Detalle de Cita',
			description: 'Recurso que expone los datos completos de una cita por su ID.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const id = Number(uri.pathname.split('/').pop());
			if (!id || id <= 0) {
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'text/plain',
							text: 'ID de cita inválido.',
						},
					],
				};
			}

			try {
				const appointment = await appointment_service.find_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(appointment, null, 2),
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Error desconocido';
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'text/plain',
							text: message,
						},
					],
				};
			}
		},
	);

	server.registerResource(
		'appointments_list',
		'appointments://list',
		{
			title: 'Listado de Citas',
			description: 'Recurso que expone el listado de citas.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await appointment_service.find({ limit: 100, offset: 0 });
			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		},
	);
};
