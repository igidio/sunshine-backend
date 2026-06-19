import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { profile_service } from "~/modules/profile/profile.service";
import { require_auth } from "~/helpers/mcp_auth";

const McpUpdateProfileDtoSchema = z.object({
	first_name: z.string().min(3).max(255).optional(),
	last_name: z.string().min(3).max(255).optional(),
	birth_date: z.string().optional().describe('Fecha de nacimiento (ISO 8601, ej: 1990-01-01)'),
	address: z.string().min(3).max(255).optional(),
	identity_number: z.string().max(20).optional(),
});

export const register_profiles_tools = (server: McpServer) => {

	server.registerTool(
		'update_profile',
		{
			title: 'Actualizar Perfil',
			description:
				'Actualiza los datos de un perfil por su ID. Permite modificar nombre, apellido, fecha de nacimiento, dirección y número de identidad.',
			inputSchema: McpUpdateProfileDtoSchema.extend({
				id: z.number().int().positive().describe('ID del perfil a actualizar'),
			}),
		},
		async ({ id, ...data }, extra) => {
			try {
				const auth_error = await require_auth(extra);
				if (auth_error) return auth_error;

				await profile_service.update_profile_by_id(id, {
					...data,
				});
				return {
					content: [
						{
							type: 'text',
							text: `Perfil con ID ${id} actualizado correctamente.`,
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
