import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";


export const registerCalculateTool = (server: McpServer) => {
	server.registerTool(
		'buscar_usuario',
		{
			title: 'Buscar Usuario',
			description: 'Busca un usuario por su ID y retorna sus datos públicos',
			inputSchema: {
				id: z.number().int().positive().describe('ID del usuario'),
			},
		},
		async ({ id }) => {
			const usuarios: Record<number, { nombre: string; email: string; rol: string }> = {
				1: { nombre: 'Ana García', email: 'ana@ejemplo.com', rol: 'admin' },
				2: { nombre: 'Luis Pérez', email: 'luis@ejemplo.com', rol: 'editor' },
				3: { nombre: 'María López', email: 'maria@ejemplo.com', rol: 'lector' },
			}

			const usuario = usuarios[id]

			if (!usuario) {
				return {
					content: [{ type: 'text', text: `No existe ningún usuario con ID ${id}` }],
					isError: true
				}
			}

			return {
				content: [{
					type: 'text',
					text: JSON.stringify(usuario, null, 2)
				}]
			}
		}
	)
};