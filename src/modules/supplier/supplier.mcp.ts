import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { supplier_service } from "~/modules/supplier/supplier.service";
import { CreateSupplierDtoSchema, ReadSupplierDtoSchema, UpdateSupplierDtoSchema } from "./supplier.dto";
import { require_auth } from "~/helpers/mcp_auth";

export const register_suppliers_tools = (server: McpServer) => {

	server.registerTool(
		'list_suppliers',
		{
			title: 'Listar Proveedores',
			description:
				'Lista los proveedores del sistema con paginación, filtros, búsqueda y filtro por estado (active/inactive).',
			inputSchema: ReadSupplierDtoSchema,
		},
		async (params) => {
			const result = await supplier_service.get(params);
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
		'get_supplier',
		{
			title: 'Obtener Proveedor',
			description: 'Obtiene los detalles completos de un proveedor por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del proveedor'),
			},
		},
		async ({ id }) => {
			try {
				const supplier = await supplier_service.get_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(supplier, null, 2),
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
		'create_supplier',
		{
			title: 'Crear Proveedor',
			description: 'Crea un nuevo proveedor en el sistema.',
			inputSchema: CreateSupplierDtoSchema.omit({ image: true }),
		},
		async (data, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "SUPPLIER" });
				if (auth_error) return auth_error;

				const supplier = await supplier_service.create(data as Parameters<typeof supplier_service.create>[0]);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(supplier, null, 2),
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
		'update_supplier',
		{
			title: 'Actualizar Proveedor',
			description:
				'Actualiza los datos de un proveedor existente. La imagen debe actualizarse a través del endpoint REST.',
			inputSchema: UpdateSupplierDtoSchema.omit({ image: true, keep_image: true }).extend({
				id: z.number().int().positive().describe('ID del proveedor a actualizar'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "SUPPLIER" });
				if (auth_error) return auth_error;

				const supplier = await supplier_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(supplier, null, 2),
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
		'delete_supplier',
		{
			title: 'Eliminar Proveedor',
			description: 'Realiza un borrado lógico (soft delete) de un proveedor por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del proveedor a eliminar'),
			},
		},
		async ({ id }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "SUPPLIER" });
				if (auth_error) return auth_error;

				await supplier_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Proveedor con ID ${id} eliminado correctamente.`,
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
		'toggle_supplier_status',
		{
			title: 'Activar/Desactivar Proveedor',
			description: 'Habilita o deshabilita un proveedor.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del proveedor'),
				disable: z.boolean().describe('true para deshabilitar, false para habilitar'),
			},
		},
		async ({ id, disable }, extra) => {
			try {
				const auth_error = await require_auth(extra, { allowed_permission: "SUPPLIER" });
				if (auth_error) return auth_error;

				await supplier_service.toggle_disable(id, disable);
				const accion = disable ? 'deshabilitado' : 'habilitado';
				return {
					content: [
						{
							type: 'text',
							text: `Proveedor con ID ${id} ${accion} correctamente.`,
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
		'supplier_detail',
		'supplier://{id}',
		{
			title: 'Detalle de Proveedor',
			description: 'Recurso que expone los datos completos de un proveedor por su ID.',
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
							text: 'ID de proveedor inválido.',
						},
					],
				};
			}

			try {
				const supplier = await supplier_service.get_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(supplier, null, 2),
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
		'suppliers_list',
		'suppliers://list',
		{
			title: 'Listado de Proveedores',
			description: 'Recurso que expone el listado completo de proveedores.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await supplier_service.get({ limit: 100, offset: 0 });
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
