import { openai } from "@ai-sdk/openai";
import { createUIMessageStream, generateId, generateText, stepCountIs, streamText } from "ai";
import { envs } from "../../config/envs";
import { mcpLocalhostTools, mcpLocalhostToolsWithClient } from "../../../mcps/localhost/mcp";
import { SYSTEM_PROMPT } from "./chat-data";
import { Client } from "@modelcontextprotocol/sdk/client";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export class VercelAiOrchestrator {
	async handle_chat(chat_history: ChatMessage[]) {
		const result = await generateText({
			model: openai.chat(envs.openai_language_model!),
			system: SYSTEM_PROMPT,
			messages: chat_history,
			tools: mcpLocalhostTools,
			stopWhen: stepCountIs(5),
		});

		return result;
	}

	async handle_chat_stream(chat_history: ChatMessage[]) {
		const stream = createUIMessageStream({
			execute: async ({ writer }) => {
				writer.write({ type: "start", messageId: generateId() });

				const result = streamText({
					model: openai.chat(envs.openai_language_model!),
					system: SYSTEM_PROMPT,
					messages: chat_history,
					
					headers: {
						bearer: "YOUR_AUTH_TOKEN"
					},
					tools: mcpLocalhostTools,
					stopWhen: stepCountIs(5),
				});

				result.consumeStream();
				writer.merge(result.toUIMessageStream());
			}
		});

		return stream;
	}
}