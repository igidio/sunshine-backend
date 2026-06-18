import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { dashboard_service } from "~/modules/dashboard/dashboard.service";

export const register_dashboard_tools = (server: McpServer) => {

	server.registerTool(
		'get_dashboard',
		{
			title: 'Obtener Dashboard',
			description:
				'Obtiene el resumen completo del dashboard con indicadores de ventas, ' +
				'citas, inventario, clientes y catálogo.',
			inputSchema: {},
		},
		async () => {
			try {
				const dashboard = await dashboard_service.get();
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(dashboard, null, 2),
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
		'dashboard_overview',
		'dashboard://overview',
		{
			title: 'Resumen del Dashboard',
			description: 'Recurso que expone el resumen completo del dashboard.',
			mimeType: 'application/json',
		},
		async (uri) => {
			try {
				const dashboard = await dashboard_service.get();
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(dashboard, null, 2),
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
