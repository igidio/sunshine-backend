import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { envs } from "../../config/envs";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import { global_events } from "~/helpers/event_bus";
import { SYSTEM_PROMPT } from "./chat-data";

const openai = new OpenAI({
  baseURL: envs.openai_base_url,
  apiKey: envs.openai_api_key,
});

type ChatMessage = { role: string; content: string };

interface BufferedToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

const TOOL_CALL_TIMEOUT = 55_000;

export class OpenAIOrchestrator {
  private static shared_mcp_client: Client | null = null;
  private static cached_openai_tools: OpenAI.Chat.ChatCompletionTool[] | null = null;
  private static init_promise: Promise<Client> | null = null;

  private static async ensure_client(): Promise<Client> {
    if (this.shared_mcp_client) return this.shared_mcp_client;

    if (!this.init_promise) {
      this.init_promise = this._init().catch(err => {
        this.init_promise = null;
        throw err;
      });
    }

    return this.init_promise;
  }

  private static async _init(): Promise<Client> {
    if (!envs.server_url) throw new ServerError(error_messages.server_url_not_defined);

    const transport = new StreamableHTTPClientTransport(
      new URL(`${envs.server_url}/mcp`)
    );

    const client = new Client(
      { name: "chat-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await client.connect(transport);

    const mcp_tools = await client.listTools();
    this.cached_openai_tools = mcp_tools.tools.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    this.shared_mcp_client = client;
    return client;
  }

  private static async execute_tool_call(
    client: Client,
    tool_call: BufferedToolCall
  ): Promise<OpenAI.Chat.ChatCompletionToolMessageParam> {
    const { function: fn } = tool_call;
    const function_name = fn.name;

    global_events.emit("new_notification", `Ejecutando herramienta: ${function_name}`);

    try {
      const function_args = JSON.parse(fn.arguments || "{}");

      const result = await Promise.race([
        client.callTool({ name: function_name, arguments: function_args }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout ejecutando ${function_name}`)), TOOL_CALL_TIMEOUT)
        ),
      ]);

      const content_array: any[] = Array.isArray(result.content) ? result.content : [];
      const tool_text = content_array
        .filter((c: any) => c?.type === "text")
        .map((c: any) => c.text as string)
        .join("\n");

      return {
        role: "tool",
        tool_call_id: tool_call.id,
        content: result.isError
          ? `Error de la herramienta: ${tool_text}`
          : tool_text,
      };
    } catch (error: any) {
      console.error(`Error en herramienta ${function_name}:`, error.message);
      return {
        role: "tool",
        tool_call_id: tool_call.id,
        content: `La ejecución de la herramienta falló: ${error.message}`,
      };
    }
  }

  private static build_messages(chat_history: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return [
      { role: "system", content: SYSTEM_PROMPT },
      ...chat_history.map(entry => ({
        role: entry.role as "user" | "assistant" | "system",
        content: entry.content,
      })),
    ];
  }

  private static async resolve_tool_calls(
    client: Client,
    tool_calls: BufferedToolCall[]
  ): Promise<OpenAI.Chat.ChatCompletionToolMessageParam[]> {
    const results = await Promise.all(
      tool_calls.map(tc => this.execute_tool_call(client, tc))
    );
    return results;
  }

  async handle_chat(chat_history: ChatMessage[]): Promise<string> {
    if (!envs.openai_language_model)
      throw new ServerError(error_messages.openai_language_model_not_defined);
    if (!envs.openai_tool_model)
      throw new ServerError(error_messages.openai_tool_model_not_defined);

    const client = await OpenAIOrchestrator.ensure_client();
    const openai_tools = OpenAIOrchestrator.cached_openai_tools!;
    const messages = OpenAIOrchestrator.build_messages(chat_history);

    const response = await openai.chat.completions.create({
      model: envs.openai_language_model,
      messages,
      tools: openai_tools.length > 0 ? openai_tools : undefined,
    });

    const response_message = response.choices[0]!.message;

    if (!response_message.tool_calls?.length) {
      return response_message.content ?? "";
    }

    messages.push(response_message);

    const tool_results = await OpenAIOrchestrator.resolve_tool_calls(client, response_message.tool_calls as BufferedToolCall[]);
    tool_results.forEach(r => messages.push(r));

    const final_response = await openai.chat.completions.create({
      model: envs.openai_tool_model,
      messages,
    });

    return final_response.choices[0]!.message.content ?? "";
  }

  private static buffer_tool_call_chunks(
    buffer: Map<number, BufferedToolCall>,
    delta: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta
  ): void {
    if (!delta.tool_calls) return;

    for (const tc of delta.tool_calls) {
      if (tc.index == null) continue;

      const existing = buffer.get(tc.index);

      if (!existing) {
        if (!tc.id || !tc.function?.name) continue;
        buffer.set(tc.index, {
          id: tc.id,
          type: "function",
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments ?? "",
          },
        });
      } else if (tc.function?.arguments) {
        existing.function.arguments += tc.function.arguments;
      }
    }
  }

  private static async flush_tool_calls(
    client: Client,
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    buffer: Map<number, BufferedToolCall>,
    full_assistant_content: string
  ): Promise<void> {
    const tool_calls = Array.from(buffer.values());

    messages.push({
      role: "assistant",
      content: full_assistant_content || null,
      tool_calls,
    });

    const results = await this.resolve_tool_calls(client, tool_calls);
    results.forEach(r => messages.push(r));
  }

  async *handle_chat_stream(
    chat_history: ChatMessage[]
  ): AsyncGenerator<string, void, unknown> {
    if (!envs.openai_language_model)
      throw new ServerError(error_messages.openai_language_model_not_defined);
    if (!envs.openai_tool_model)
      throw new ServerError(error_messages.openai_tool_model_not_defined);

    const client = await OpenAIOrchestrator.ensure_client();
    const openai_tools = OpenAIOrchestrator.cached_openai_tools!;
    const messages = OpenAIOrchestrator.build_messages(chat_history);

    const first_stream = await openai.chat.completions.create({
      model: envs.openai_language_model,
      messages,
      tools: openai_tools.length > 0 ? openai_tools : undefined,
      stream: true,
    });

    const tool_calls_buffer = new Map<number, BufferedToolCall>();
    let full_content = "";

    for await (const chunk of first_stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.tool_calls) {
        OpenAIOrchestrator.buffer_tool_call_chunks(tool_calls_buffer, delta);
      } else if (delta.content) {
        full_content += delta.content;
        yield delta.content;
      }
    }

    if (tool_calls_buffer.size === 0) return;

    await OpenAIOrchestrator.flush_tool_calls(client, messages, tool_calls_buffer, full_content);

    const final_stream = await openai.chat.completions.create({
      model: envs.openai_tool_model,
      messages,
      stream: true,
    });

    for await (const chunk of final_stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) yield delta.content;
    }
  }
}