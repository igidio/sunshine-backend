import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { movement_service } from "~/modules/movement/movement.service";
import { CreateMovementDtoSchema, ReadMovementDtoSchema, UpdateMovementDtoSchema } from "./movement.dto";
import { PaginationTypeSchema } from "~/helpers/types";
import { movement_type } from "./movement.schema";
import { require_auth } from "~/helpers/mcp_auth";

const McpReadMovementDtoSchema = PaginationTypeSchema.extend({
	type: z.enum(movement_type).optional(),
	stock_id: z.coerce.number().int().positive().optional(),
	supplier_id: z.coerce.number().int().positive().optional(),
	from: z.string().optional().describe('Fecha de inicio (ISO 8601)'),
	to: z.string().optional().describe('Fecha de fin (ISO 8601)'),
});

export const register_movements_tools = (server: McpServer) => {

	server.registerTool(
		'list_movements',
		{
			title: 'Listar Movimientos',
			description:
				'Lista los movimientos de stock con paginación, filtros por tipo, stock_id, supplier_id y rango de fechas.',
			inputSchema: McpReadMovementDtoSchema,
		},
		async (params) => {
			const result = await movement_service.get({
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
		'get_movement',
		{
			title: 'Obtener Movimiento',
			description: 'Obtiene los detalles de un movimiento de stock por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del movimiento'),
			},
		},
		async ({ id }) => {
			try {
				const movement = await movement_service.get_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(movement, null, 2),
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
		'create_movement',
		{
			title: 'Crear Movimiento',
			description:
				'Registra un nuevo movimiento de stock (compra, vencimiento, dañado, perdido, ajuste, uso interno). ' +
				'Actualiza automáticamente la cantidad en stock.',
			inputSchema: CreateMovementDtoSchema,
		},
		async (data, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "MOVEMENT" });
				if (auth_error) return auth_error;

				const movement = await movement_service.create(data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(movement, null, 2),
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
		'update_movement',
		{
			title: 'Actualizar Movimiento',
			description:
				'Actualiza los datos de un movimiento existente. Ajusta automáticamente el stock afectado.',
			inputSchema: UpdateMovementDtoSchema.extend({
				id: z.number().int().positive().describe('ID del movimiento a actualizar'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "MOVEMENT" });
				if (auth_error) return auth_error;

				const movement = await movement_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(movement, null, 2),
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
		'delete_movement',
		{
			title: 'Eliminar Movimiento',
			description: 'Elimina un movimiento y revierte su efecto en el stock.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del movimiento a eliminar'),
			},
		},
		async ({ id }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "MOVEMENT" });
				if (auth_error) return auth_error;

				await movement_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Movimiento con ID ${id} eliminado y stock revertido correctamente.`,
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
		'movement_detail',
		'movement://{id}',
		{
			title: 'Detalle de Movimiento',
			description: 'Recurso que expone los datos de un movimiento por su ID.',
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
							text: 'ID de movimiento inválido.',
						},
					],
				};
			}

			try {
				const movement = await movement_service.get_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(movement, null, 2),
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
		'movements_list',
		'movements://list',
		{
			title: 'Listado de Movimientos',
			description: 'Recurso que expone el listado de movimientos recientes.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await movement_service.get({ limit: 100, offset: 0 });
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
