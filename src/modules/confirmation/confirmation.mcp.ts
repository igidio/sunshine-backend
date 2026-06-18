import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { confirmation_service } from "~/modules/confirmation/confirmation.service";
import { confirmation_types } from "./confirmation.schema";

export const register_confirmations_tools = (server: McpServer) => {

	server.registerTool(
		'list_confirmations',
		{
			title: 'Listar Confirmaciones',
			description:
				'Lista las confirmaciones del sistema con filtro por tipo (recovery, verification, add_admin) y descripción.',
			inputSchema: {
				type: z.enum(confirmation_types).optional().describe('Filtrar por tipo de confirmación'),
				description: z.string().optional().describe('Filtrar por descripción'),
			},
		},
		async (params) => {
			const result = await confirmation_service.find(params);
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
		'get_confirmation',
		{
			title: 'Obtener Confirmación',
			description: 'Obtiene una confirmación por su token.',
			inputSchema: {
				token: z.string().describe('Token de confirmación'),
			},
		},
		async ({ token }) => {
			try {
				const confirmation = await confirmation_service.find_one(token);
				if (!confirmation) {
					return {
						content: [{ type: 'text', text: 'Confirmación no encontrada.' }],
						isError: true,
					};
				}
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(confirmation, null, 2),
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
		'check_confirmation',
		{
			title: 'Verificar Confirmación',
			description:
				'Verifica la validez de un token de confirmación. ' +
				'Comprueba que exista, esté vigente, no haya expirado y no haya sido usado.',
			inputSchema: {
				token: z.string().describe('Token de confirmación a verificar'),
			},
		},
		async ({ token }) => {
			try {
				const confirmation = await confirmation_service.check(token);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(confirmation, null, 2),
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
};
