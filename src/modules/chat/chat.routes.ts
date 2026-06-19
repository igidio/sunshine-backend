import { Elysia } from "elysia";
import { createUIMessageStreamResponse } from "ai";
import z from "zod";
import { VercelAiOrchestrator } from "./vercel_ai-orchestrator";
import { plugin_auth } from "~/plugins/auth";
import bearer from "@elysia/bearer";


const ChatMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string().min(1, "El mensaje no puede estar vacío"),
});

export const chat_routes = new Elysia({ prefix: '/chat' })
	.decorate('orchestrator', new VercelAiOrchestrator())
	.use(plugin_auth)
	.use(bearer())
	.post('/', async ({ body, orchestrator, bearer }) => {
		const result = await orchestrator.handle_chat(body, { Authorization: `Bearer ${bearer}` });
		return { reply: result.text };
	}, {
		body: z.array(ChatMessageSchema).min(1, "El historial no puede estar vacío"),
		auth: true,
	})
	.post('/stream', async ({ body, orchestrator, bearer }) => {
		const stream = await orchestrator.handle_chat_stream(body, { Authorization: `Bearer ${bearer}` });
		return createUIMessageStreamResponse({ stream });
	}, {
		body: z.array(ChatMessageSchema).min(1, "El historial no puede estar vacío"),
		auth: true,
	})