import { Elysia } from "elysia";
import { ChatOrchestrator } from "./orchestrator";
import z from "zod";

export const chat_routes = new Elysia({ prefix: '/chat' })
	.decorate('orchestrator', new ChatOrchestrator())
	.post('/', async ({ body, orchestrator }) => {
		const response = await orchestrator.handle_chat(body);

		return {
			reply: response
		};

	}, {
		body: z.array(z.object({
			role: z.string(),
			content: z.string()
		}))
	});