import { openai } from "@ai-sdk/openai";
import { createUIMessageStream, generateId, generateText, stepCountIs, streamText } from "ai";
import { envs } from "../../config/envs";
import { SYSTEM_PROMPT } from "./chat-data";
import { createMCPClient } from '@ai-sdk/mcp'

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export class VercelAiOrchestrator {

	async create_mcp_client(headers?: Record<string, string>) {
		const client = await createMCPClient({
			transport: {
				type: 'http',
				url: 'http://localhost:3000/mcp',
				headers: {
					...headers,
				}
			}
		});
		return client;
	}

	async handle_chat(chat_history: ChatMessage[], headers?: Record<string, string>, system_prompt?: string) {
		const http_client = await this.create_mcp_client(headers);
		const tools = await http_client.tools();

		const result = await generateText({
			model: openai.chat(envs.openai_language_model!),
			system: system_prompt ? SYSTEM_PROMPT + '. ' + system_prompt : SYSTEM_PROMPT,
			messages: chat_history,
			tools,
			stopWhen: stepCountIs(5),
		});

		return result;
	}

	async handle_chat_stream(chat_history: ChatMessage[], headers?: Record<string, string>, system_prompt?: string) {
		const http_client = await this.create_mcp_client(headers);
		const tools = await http_client.tools();

		const stream = createUIMessageStream({
			execute: async ({ writer }) => {
				writer.write({ type: "start", messageId: generateId() });

				const result = streamText({
					model: openai.chat(envs.openai_language_model!),
					system: system_prompt ? SYSTEM_PROMPT + '. ' + system_prompt : SYSTEM_PROMPT,
					messages: chat_history,
					tools,
					stopWhen: stepCountIs(5),
				});

				result.consumeStream();
				writer.merge(result.toUIMessageStream());
			},
			onFinish: async () => {
				await http_client.close();
			}
		});

		return stream;
	}
}