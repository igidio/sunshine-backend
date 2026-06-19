import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { user_service } from "~/modules/user/user.service";
import { ReadUserDtoSchema, UpdateUserDtoSchema, ToggleDisabledUserDtoSchema, SetPermissionsUserDtoSchema } from "./user.dto";
import { require_auth } from "~/helpers/mcp_auth";

export const register_users_tools = (server: McpServer) => {

	server.registerTool(
		'list_users',
		{
			title: 'Listar Usuarios',
			description:
				'Lista los usuarios del sistema con paginación, filtros por rol y estado (active/inactive).',
			inputSchema: ReadUserDtoSchema,
		},
		async (params) => {
			const result = await user_service.find(params);
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
		'get_user',
		{
			title: 'Obtener Usuario',
			description: 'Obtiene los detalles de un usuario por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del usuario'),
			},
		},
		async ({ id }) => {
			try {
				const user = await user_service.find_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(user, null, 2),
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
		'update_user',
		{
			title: 'Actualizar Usuario',
			description:
				'Actualiza los datos de un usuario: username, email y phone_number. ' +
				'No permite cambiar la contraseña (usar el endpoint REST correspondiente).',
			inputSchema: UpdateUserDtoSchema.extend({
				id: z.number().int().positive().describe('ID del usuario a actualizar'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra);
				if (auth_error) return auth_error;

				const user = await user_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(user, null, 2),
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
		'toggle_user_status',
		{
			title: 'Activar/Desactivar Usuario',
			description: 'Habilita o deshabilita un usuario.',
			inputSchema: ToggleDisabledUserDtoSchema.extend({
				id: z.number().int().positive().describe('ID del usuario'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_roles: ["superuser", "admin"] });
				if (auth_error) return auth_error;

				await user_service.toggle_disabled(id, data);
				const accion = data.disabled ? 'deshabilitado' : 'habilitado';
				return {
					content: [
						{
							type: 'text',
							text: `Usuario con ID ${id} ${accion} correctamente.`,
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
		'set_user_permissions',
		{
			title: 'Establecer Permisos de Usuario',
			description: 'Asigna permisos específicos a un usuario (solo para roles employer/admin).',
			inputSchema: SetPermissionsUserDtoSchema.extend({
				id: z.number().int().positive().describe('ID del usuario'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_roles: ["superuser", "admin"] });
				if (auth_error) return auth_error;

				const user = await user_service.set_permissions(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(user, null, 2),
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
		'user_detail',
		'user://{id}',
		{
			title: 'Detalle de Usuario',
			description: 'Recurso que expone los datos de un usuario por su ID.',
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
							text: 'ID de usuario inválido.',
						},
					],
				};
			}

			try {
				const user = await user_service.find_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(user, null, 2),
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
		'users_list',
		'users://list',
		{
			title: 'Listado de Usuarios',
			description: 'Recurso que expone el listado completo de usuarios.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await user_service.find({ limit: 100, offset: 0 });
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
