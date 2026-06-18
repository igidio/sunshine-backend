import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { customer_service } from "~/modules/customer/customer.service";
import { ReadCustomerDtoSchema } from "./customer.dto";

const McpCreateCustomerDtoSchema = z.object({
	phone_number: z.string().max(10).optional().describe('Número de teléfono'),
	first_name: z.string().min(3).max(255).describe('Nombre'),
	last_name: z.string().min(3).max(255).describe('Apellido'),
	birth_date: z.string().optional().default("1970-01-01").describe('Fecha de nacimiento (ISO 8601, ej: 1990-01-01)'),
	address: z.string().min(3).max(255).optional().describe('Dirección'),
	identity_number: z.string().max(20).optional().describe('Número de identidad'),
});

const McpUpdateCustomerDtoSchema = McpCreateCustomerDtoSchema.partial();

export const register_customers_tools = (server: McpServer) => {

	server.registerTool(
		'list_customers',
		{
			title: 'Listar Clientes',
			description:
				'Lista los clientes del sistema con paginación, filtros, búsqueda y filtro por estado (active/inactive).',
			inputSchema: ReadCustomerDtoSchema,
		},
		async (params) => {
			const result = await customer_service.find(params);
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
		'get_customer',
		{
			title: 'Obtener Cliente',
			description: 'Obtiene los detalles completos de un cliente por su ID, incluyendo su perfil.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del cliente'),
			},
		},
		async ({ id }) => {
			try {
				const customer = await customer_service.find_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(customer, null, 2),
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
		'create_customer',
		{
			title: 'Crear Cliente',
			description:
				'Crea un nuevo cliente en el sistema. Se creará automáticamente el perfil asociado.',
			inputSchema: McpCreateCustomerDtoSchema,
		},
		async (data) => {
			try {
				const customer = await customer_service.create({
					...data,
					birth_date: data.birth_date ?? "1970-01-01",
				});
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(customer, null, 2),
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
		'update_customer',
		{
			title: 'Actualizar Cliente',
			description:
				'Actualiza los datos de un cliente existente y su perfil asociado.',
			inputSchema: McpUpdateCustomerDtoSchema.extend({
				id: z.number().int().positive().describe('ID del cliente a actualizar'),
			}),
		},
		async ({ id, ...data }) => {
			try {
				const customer = await customer_service.update(id, {
					...data,
				});
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(customer, null, 2),
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
		'toggle_customer_status',
		{
			title: 'Activar/Desactivar Cliente',
			description: 'Habilita o deshabilita un cliente.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del cliente'),
				disabled: z.boolean().optional().describe('true para deshabilitar, false para habilitar. Si no se especifica, alterna el estado.'),
			},
		},
		async ({ id, disabled }) => {
			try {
				await customer_service.toggle_disabled(id, disabled);
				const accion = disabled ? 'deshabilitado' : 'habilitado';
				return {
					content: [
						{
							type: 'text',
							text: `Cliente con ID ${id} ${accion} correctamente.`,
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
		'delete_customer',
		{
			title: 'Eliminar Cliente',
			description: 'Realiza un borrado lógico (soft delete) de un cliente por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del cliente a eliminar'),
			},
		},
		async ({ id }) => {
			try {
				await customer_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Cliente con ID ${id} eliminado correctamente.`,
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
		'customer_detail',
		'customer://{id}',
		{
			title: 'Detalle de Cliente',
			description: 'Recurso que expone los datos completos de un cliente por su ID.',
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
							text: 'ID de cliente inválido.',
						},
					],
				};
			}

			try {
				const customer = await customer_service.find_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(customer, null, 2),
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
		'customers_list',
		'customers://list',
		{
			title: 'Listado de Clientes',
			description: 'Recurso que expone el listado completo de clientes activos.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await customer_service.find({ limit: 100, offset: 0 });
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
