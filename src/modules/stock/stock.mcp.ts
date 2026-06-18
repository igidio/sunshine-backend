import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { stock_service } from "~/modules/stock/stock.service";

export const register_stock_tools = (server: McpServer) => {

	server.registerTool(
		'get_stock',
		{
			title: 'Obtener Stock',
			description: 'Obtiene el registro de stock por su ID.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del registro de stock'),
			},
		},
		async ({ id }) => {
			try {
				const stock = await stock_service.get_one(id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(stock, null, 2),
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
		'get_stock_by_product',
		{
			title: 'Obtener Stock por Producto',
			description: 'Obtiene el registro de stock asociado a un producto.',
			inputSchema: {
				product_id: z.number().int().positive().describe('ID del producto'),
			},
		},
		async ({ product_id }) => {
			try {
				const stock = await stock_service.get_by_product(product_id);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(stock, null, 2),
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
		'update_stock_quantity',
		{
			title: 'Actualizar Cantidad de Stock',
			description:
				'Actualiza la cantidad de stock de un registro. ' +
				'La cantidad no puede ser negativa. Se recomienda usar movimientos para registrar cambios.',
			inputSchema: {
				id: z.number().int().positive().describe('ID del registro de stock'),
				quantity: z.number().int().nonnegative().describe('Nueva cantidad de stock'),
			},
		},
		async ({ id, quantity }) => {
			try {
				const stock = await stock_service.update_quantity(id, quantity);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(stock, null, 2),
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
		'stock_detail',
		'stock://{id}',
		{
			title: 'Detalle de Stock',
			description: 'Recurso que expone los datos de un registro de stock por su ID.',
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
							text: 'ID de stock inválido.',
						},
					],
				};
			}

			try {
				const stock = await stock_service.get_one(id);
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(stock, null, 2),
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
};
