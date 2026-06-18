import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { treatment_service } from "~/modules/treatment/treatment.service";
import { CreateTreatmentDtoSchema, ReadTreatmentDtoSchema, UpdateTreatmentDtoSchema } from "./treatment.dto";

export const register_treatments_tools = (server: McpServer) => {

	server.registerTool(
		'list_treatments',
		{
			title: 'Listar Tratamientos',
			description:
				'Lista los tratamientos del sistema con paginación, filtros y búsqueda por nombre o descripción.',
			inputSchema: ReadTreatmentDtoSchema,
		},
		async (params) => {
			const result = await treatment_service.find(params);
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
		'get_treatment',
		{
			title: 'Obtener Tratamiento',
			description: 'Obtiene los detalles completos de un tratamiento por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del tratamiento'),
			},
		},
		async ({ id }) => {
			try {
				const treatment = await treatment_service.find_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(treatment, null, 2),
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
		'create_treatment',
		{
			title: 'Crear Tratamiento',
			description:
				'Crea un nuevo tratamiento en el sistema con nombre, descripción, precio y duración en minutos.',
			inputSchema: CreateTreatmentDtoSchema,
		},
		async (data) => {
			try {
				const treatment = await treatment_service.create(data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(treatment, null, 2),
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
		'update_treatment',
		{
			title: 'Actualizar Tratamiento',
			description: 'Actualiza los datos de un tratamiento existente.',
			inputSchema: UpdateTreatmentDtoSchema.extend({
				id: z.number().int().positive().describe('ID del tratamiento a actualizar'),
			}),
		},
		async ({ id, ...data }) => {
			try {
				const treatment = await treatment_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(treatment, null, 2),
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
		'delete_treatment',
		{
			title: 'Eliminar Tratamiento',
			description: 'Realiza un borrado lógico (soft delete) de un tratamiento por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del tratamiento a eliminar'),
			},
		},
		async ({ id }) => {
			try {
				await treatment_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Tratamiento con ID ${id} eliminado correctamente.`,
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
		'toggle_treatment_status',
		{
			title: 'Activar/Desactivar Tratamiento',
			description: 'Habilita o deshabilita un tratamiento.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del tratamiento'),
				disabled: z.boolean().optional().describe('true para deshabilitar, false para habilitar. Si no se especifica, alterna el estado.'),
			},
		},
		async ({ id, disabled }) => {
			try {
				await treatment_service.toggle_disabled(id, { disabled } as { disabled?: boolean });
				const accion = disabled ? 'deshabilitado' : 'habilitado';
				return {
					content: [
						{
							type: 'text',
							text: `Tratamiento con ID ${id} ${accion} correctamente.`,
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
		'treatment_detail',
		'treatment://{id}',
		{
			title: 'Detalle de Tratamiento',
			description: 'Recurso que expone los datos completos de un tratamiento por su ID.',
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
							text: 'ID de tratamiento inválido.',
						},
					],
				};
			}

			try {
				const treatment = await treatment_service.find_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(treatment, null, 2),
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
		'treatments_list',
		'treatments://list',
		{
			title: 'Listado de Tratamientos',
			description: 'Recurso que expone el listado completo de tratamientos.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await treatment_service.find({ limit: 100, offset: 0 });
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
