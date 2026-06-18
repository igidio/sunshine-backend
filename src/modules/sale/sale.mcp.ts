import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { sale_service } from "~/modules/sale/sale.service";
import { CreateSaleDtoSchema, UpdateSaleDtoSchema } from "./sale.dto";
import { PaginationTypeSchema, IdsSchema } from "~/helpers/types";
import { sale_payment_method } from "./sale.schema";

const McpReadSaleDtoSchema = PaginationTypeSchema.extend({
	customer_id: z.coerce.number().int().positive().optional(),
	ids: IdsSchema,
	from: z.string().optional().describe('Fecha de inicio (ISO 8601)'),
	to: z.string().optional().describe('Fecha de fin (ISO 8601)'),
	payment_method: z.enum(sale_payment_method).optional(),
	min_price: z.coerce.number().nonnegative().optional(),
	max_price: z.coerce.number().nonnegative().optional(),
});

export const register_sales_tools = (server: McpServer) => {

	server.registerTool(
		'list_sales',
		{
			title: 'Listar Ventas',
			description:
				'Lista las ventas del sistema con paginación, filtros por cliente, método de pago, rango de precios y fechas.',
			inputSchema: McpReadSaleDtoSchema,
		},
		async (params) => {
			const result = await sale_service.find({
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
		'get_sale',
		{
			title: 'Obtener Venta',
			description: 'Obtiene los detalles completos de una venta por su ID, incluyendo productos, citas y factura.',
			inputSchema: {
				id: z.number().int().positive().describe('ID de la venta'),
			},
		},
		async ({ id }) => {
			try {
				const sale = await sale_service.find_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(sale, null, 2),
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
		'create_sale',
		{
			title: 'Crear Venta',
			description:
				'Crea una nueva venta en el sistema. ' +
				'Puede incluir productos y/o citas (tratamientos). ' +
				'Se genera automáticamente la factura y se descuenta el stock de los productos.',
			inputSchema: CreateSaleDtoSchema,
		},
		async (data) => {
			try {
				const sale = await sale_service.create(data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(sale, null, 2),
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
		'update_sale',
		{
			title: 'Actualizar Venta',
			description:
				'Actualiza una venta existente. Permite modificar productos, citas y método de pago. ' +
				'Reajusta automáticamente el stock y recalcula el total.',
			inputSchema: UpdateSaleDtoSchema.extend({
				id: z.number().int().positive().describe('ID de la venta a actualizar'),
			}),
		},
		async ({ id, ...data }) => {
			try {
				const sale = await sale_service.update(id, data);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(sale, null, 2),
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
		'sale_detail',
		'sale://{id}',
		{
			title: 'Detalle de Venta',
			description: 'Recurso que expone los datos completos de una venta por su ID.',
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
							text: 'ID de venta inválido.',
						},
					],
				};
			}

			try {
				const sale = await sale_service.find_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(sale, null, 2),
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
		'sales_list',
		'sales://list',
		{
			title: 'Listado de Ventas',
			description: 'Recurso que expone el listado de ventas recientes.',
			mimeType: 'application/json',
		},
		async (uri) => {
			const result = await sale_service.find({ limit: 100, offset: 0 });
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
