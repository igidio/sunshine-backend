import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { product_service } from "~/modules/product/product.service";
import { McpCreateProductSchema, McpUpdateProductSchema, ReadProductDtoSchema } from "./product.dto";

const format_product = (p: Record<string, unknown>) => ({
	id: p.id,
	name: p.name,
	description: p.description,
	price: p.price,
	category: p.category ?? null,
	images: Array.isArray(p.images)
		? (p.images as Array<Record<string, unknown>>).map((img) => ({
			id: img.id,
			url: img.image_url,
		}))
		: [],
	stock: p.stock
		? {
			id: (p.stock as Record<string, unknown>).id,
			quantity: (p.stock as Record<string, unknown>).quantity,
		}
		: null,
	created_at: p.created_at,
	updated_at: p.updated_at,
	disabled_at: p.disabled_at,
});


export const register_products_tools = (server: McpServer) => {

	server.registerTool(
		'list_products',
		{
			title: 'Listar Productos',
			description:
				'Lista los productos del sistema con paginación, filtros y búsqueda. ' +
				'Soporta filtrado por categoría, rango de precios, rango de stock, estado (active/inactive) y búsqueda por nombre o descripción.',
			inputSchema: ReadProductDtoSchema,
		},
		async (params) => {
			const result = await product_service.find_all(params);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								...result,
								data: result.data.map(format_product),
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	server.registerTool(
		'get_product',
		{
			title: 'Obtener Producto',
			description: 'Obtiene los detalles completos de un producto por su ID, incluyendo imágenes, stock y categoría.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del producto'),
			},
		},
		async ({ id }) => {
			try {
				const product = await product_service.find_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(format_product(product), null, 2),
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
		'create_product',
		{
			title: 'Crear Producto',
			description:
				'Crea un nuevo producto en el sistema. ' +
				'Se creará automáticamente el registro de stock asociado. ' +
				'Las imágenes deben subirse posteriormente a través del endpoint REST correspondiente.',
			inputSchema: McpCreateProductSchema,
		},
		async (data) => {
			try {
				const product = await product_service.create(data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(format_product(product as unknown as Record<string, unknown>), null, 2),
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
		'update_product',
		{
			title: 'Actualizar Producto',
			description:
				'Actualiza los datos de un producto existente. Permite modificar nombre, descripción, precio, categoría y eliminar imágenes específicas.',
			inputSchema: McpUpdateProductSchema,
		},
		async ({ id, ...data }) => {
			try {
				const product = await product_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(format_product(product as unknown as Record<string, unknown>), null, 2),
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
		'delete_product',
		{
			title: 'Eliminar Producto',
			description: 'Realiza un borrado lógico (soft delete) de un producto por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del producto a eliminar'),
			},
		},
		async ({ id }) => {
			try {
				await product_service.delete(id);
				return {
					content: [
						{
							type: 'text',
							text: `Producto con ID ${id} eliminado correctamente.`,
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
		'toggle_product_status',
		{
			title: 'Activar/Desactivar Producto',
			description: 'Habilita o deshabilita un producto. Un producto deshabilitado no aparecerá en los listados con filtro "active".',
			inputSchema: {
				id: z.number().int().positive().describe('ID del producto'),
				disable: z.boolean().describe('true para deshabilitar, false para habilitar'),
			},
		},
		async ({ id, disable }) => {
			try {
				await product_service.toggle_disable(id, disable);
				const accion = disable ? 'deshabilitado' : 'habilitado';
				return {
					content: [
						{
							type: 'text',
							text: `Producto con ID ${id} ${accion} correctamente.`,
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
		'product_detail',
		'product://{id}',
		{
			title: 'Detalle de Producto',
			description: 'Recurso que expone los datos completos de un producto por su ID.',
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
							text: 'ID de producto inválido.',
						},
					],
				};
			}

			try {
				const product = await product_service.find_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(
								format_product(product as unknown as Record<string, unknown>),
								null,
								2,
							),
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
		'products_list',
		'products://list',
		{
			title: 'Listado de Productos',
			description: 'Recurso que expone el listado completo de productos activos.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await product_service.find_all({ limit: 100, offset: 0 });
			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: JSON.stringify(
							{
								...result,
								data: result.data.map(format_product),
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	server.registerPrompt(
		'create_product_prompt',
		{
			title: 'Asistente de Creación de Producto',
			description:
				'Guía al usuario paso a paso para crear un nuevo producto en el sistema, ' +
				'solicitando los campos requeridos: nombre, descripción, precio y categoría.',
		},
		async () => {
			return {
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text:
								'Vamos a crear un nuevo producto en el sistema Sunshine. ' +
								'Necesito la siguiente información:\n\n' +
								'1. **Nombre del producto** (obligatorio, máximo 255 caracteres)\n' +
								'2. **Descripción** (obligatorio, máximo 1000 caracteres)\n' +
								'3. **Precio** (obligatorio, número positivo)\n' +
								'4. **ID de la categoría** (obligatorio, número entero positivo)\n\n' +
								'Por favor, proporcióname estos datos para continuar.',
						},
					},
				],
			};
		},
	);

	server.registerPrompt(
		'search_products_prompt',
		{
			title: 'Asistente de Búsqueda de Productos',
			description:
				'Ayuda al usuario a construir una consulta de búsqueda de productos ' +
				'con filtros por categoría, precio, stock y estado.',
		},
		async () => {
			return {
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text:
								'Puedo ayudarte a buscar productos en el sistema. ' +
								'Puedes filtrar por los siguientes criterios:\n\n' +
								'- **search**: texto libre para buscar por nombre o descripción\n' +
								'- **category_id**: filtrar por categoría específica\n' +
								'- **min_price / max_price**: rango de precios\n' +
								'- **min_stock / max_stock**: rango de stock disponible\n' +
								'- **status**: "active" para productos activos, "inactive" para deshabilitados\n' +
								'- **sort_by**: ordenar por "name", "price", "created_at" o "updated_at"\n' +
								'- **order**: "asc" o "desc"\n' +
								'- **limit / offset**: paginación (por defecto 10 registros)\n\n' +
								'¿Qué criterios de búsqueda te interesan?',
						},
					},
				],
			};
		},
	);
};
