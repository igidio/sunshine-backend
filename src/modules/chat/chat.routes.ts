import { Elysia } from "elysia";
import { createUIMessageStreamResponse } from "ai";
import z from "zod";
import { VercelAiOrchestrator } from "./vercel_ai-orchestrator";

const ChatMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string().min(1, "El mensaje no puede estar vacío"),
});

export const chat_routes = new Elysia({ prefix: '/chat' })
	.decorate('orchestrator', new VercelAiOrchestrator())
	.post('/', async ({ body, orchestrator }) => {
		const result = await orchestrator.handle_chat(body);
		return { reply: result.text };
	}, {
		body: z.array(ChatMessageSchema).min(1, "El historial no puede estar vacío"),
	})
	.post('/stream', async ({ body, orchestrator }) => {
		const stream = await orchestrator.handle_chat_stream(body);
		return createUIMessageStreamResponse({ stream });
	}, {
		body: z.array(ChatMessageSchema).min(1, "El historial no puede estar vacío"),
	})