import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { category_service } from "~/modules/category/category.service";
import { CreateCategoryDtoSchema, ReadCategoryDtoSchema } from "./category.dto";
import { require_auth } from "~/helpers/mcp_auth";

export const register_categories_tools = (server: McpServer) => {

	server.registerTool(
		'list_categories',
		{
			title: 'Listar Categorías',
			description:
				'Lista las categorías del sistema con paginación, filtros y búsqueda por nombre o descripción.',
			inputSchema: ReadCategoryDtoSchema,
		},
		async (params) => {
			const result = await category_service.get(params);
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
		'get_category',
		{
			title: 'Obtener Categoría',
			description: 'Obtiene los detalles de una categoría por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID de la categoría'),
			},
		},
		async ({ id }) => {
			try {
				const category = await category_service.get_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(category, null, 2),
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
		'create_category',
		{
			title: 'Crear Categoría',
			description: 'Crea una nueva categoría en el sistema.',
			inputSchema: CreateCategoryDtoSchema,
		},
		async (data, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "CATEGORY" });
				if (auth_error) return auth_error;

				const category = await category_service.create(data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(category, null, 2),
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
		'update_category',
		{
			title: 'Actualizar Categoría',
			description: 'Actualiza los datos de una categoría existente.',
			inputSchema: CreateCategoryDtoSchema.partial().extend({
				id: z.number().int().positive().describe('ID de la categoría a actualizar'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "CATEGORY" });
				if (auth_error) return auth_error;

				const category = await category_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(category, null, 2),
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
		'delete_category',
		{
			title: 'Eliminar Categoría',
			description: 'Realiza un borrado lógico (soft delete) de una categoría por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID de la categoría a eliminar'),
			},
		},
		async ({ id }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "CATEGORY" });
				if (auth_error) return auth_error;

				await category_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Categoría con ID ${id} eliminada correctamente.`,
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
		'category_detail',
		'category://{id}',
		{
			title: 'Detalle de Categoría',
			description: 'Recurso que expone los datos de una categoría por su ID.',
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
							text: 'ID de categoría inválido.',
						},
					],
				};
			}

			try {
				const category = await category_service.get_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(category, null, 2),
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
		'categories_list',
		'categories://list',
		{
			title: 'Listado de Categorías',
			description: 'Recurso que expone el listado completo de categorías.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await category_service.get({ limit: 100, offset: 0 });
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
