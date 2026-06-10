import { Elysia, sse } from "elysia";
import { ChatOrchestrator } from "./orchestrator";
import z from "zod";

const ChatMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string().min(1, "El mensaje no puede estar vacío"),
});

export const chat_routes = new Elysia({ prefix: '/chat' })
	.decorate('orchestrator', new ChatOrchestrator())
	.post('/', async ({ body, orchestrator }) => {

		const reply = await orchestrator.handle_chat(body);
		return { reply };
	}, {
		body: z.array(ChatMessageSchema).min(1, "El historial no puede estar vacío"),
	})
	.post('/stream', async function* ({ body, orchestrator, headers }) {
		const accept = headers["accept"];
		if (accept !== "text/event-stream") {
			throw new Error("Se requiere Accept: text/event-stream");
		}
		for await (const chunk of orchestrator.handle_chat_stream(body)) {
			yield chunk;
		}
	}, {
		body: z.array(ChatMessageSchema).min(1, "El historial no puede estar vacío"),
		headers: z.object({
			accept: z.string(),
		}),
	})