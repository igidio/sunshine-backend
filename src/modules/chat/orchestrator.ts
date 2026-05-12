import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { envs } from "../../config/envs";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";

const openai = new OpenAI({
  baseURL: envs.openai_base_url,
  apiKey: envs.openai_api_key,
});

export class ChatOrchestrator {
  private mcp_client: Client | null = null;

  async init_mcp_client() {
    if (!envs.server_url) throw new ServerError(error_messages.server_url_not_defined);

    if (!this.mcp_client) {
      const transport = new StreamableHTTPClientTransport(
        new URL(`${envs.server_url}/mcp`)
      );

      this.mcp_client = new Client(
        { name: "chat-client", version: "1.0.0" },
        { capabilities: {} }
      );

      await this.mcp_client.connect(transport);
    }
    return this.mcp_client;
  }

  async handle_chat(chat_history: { role: string; content: string }[]): Promise<string> {

    if (!envs.openai_language_model) throw new ServerError(error_messages.openai_language_model_not_defined);
    if (!envs.openai_tool_model) throw new ServerError(error_messages.openai_tool_model_not_defined);

    const client = await this.init_mcp_client();

    const mcp_tools = await client.listTools();
    const openai_tools = mcp_tools.tools.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: "Eres un asistente útil que responde a las peticiones usando las herramientas suministradas si es necesario." },
      ...chat_history.map(entry => {
        if (entry.role === "function") {
          return { role: "function" as const, name: "function", content: entry.content };
        }

        return { role: entry.role as "user" | "assistant" | "system", content: entry.content };
      })
    ];
    let response;

    try {
      response = await openai.chat.completions.create({
        model: envs.openai_language_model,
        messages,
        tools: openai_tools.length > 0 ? openai_tools : undefined,
      });
    } catch (error: any) {
      throw error;
    }

    const response_message = response.choices[0]!.message;

    if (!response_message.tool_calls || response_message.tool_calls.length === 0) {
      return response_message.content ?? "";
    }

    messages.push(response_message);

    for (const tool_call of response_message.tool_calls) {
      if (tool_call.type !== "function") {
        continue;
      }

      const function_name = tool_call.function.name;
      const function_args = JSON.parse(tool_call.function.arguments);

      console.log(`Ejecutando herramienta MCP: ${function_name}`, function_args);

      try {
        const result = await client.callTool({
          name: function_name,
          arguments: function_args,
        });

        const content_array: any[] = Array.isArray(result.content) ? result.content : [];
        const tool_text_result = content_array
          .filter(c => c && c.type === "text")
          .map(c => (c as any).text)
          .join("\n");

        messages.push({
          role: "tool",
          tool_call_id: tool_call.id,
          content: result.isError
            ? `Error de la herramienta: ${tool_text_result}`
            : tool_text_result,
        });

      } catch (error: any) {
        console.error(`Error de red o ejecución fallida en herramienta ${function_name}`, error);
        messages.push({
          role: "tool",
          tool_call_id: tool_call.id,
          content: `La ejecución de la herramienta falló en el servidor: ${error.message}`,
        });
      }
    }

    const final_response = await openai.chat.completions.create({
      model: envs.openai_tool_model,
      messages,
    });

    return final_response.choices[0]!.message.content || "";
  }

  async *handle_chat_stream(user_message: string): AsyncGenerator<string, void, unknown> {
    if (!envs.openai_language_model) throw new ServerError(error_messages.openai_language_model_not_defined);
    if (!envs.openai_tool_model) throw new ServerError(error_messages.openai_tool_model_not_defined);

    const client = await this.init_mcp_client();
    const mcp_tools = await client.listTools();
    const openai_tools = mcp_tools.tools.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: "Eres un asistente útil que responde a las peticiones usando las herramientas suministradas si es necesario." },
      { role: "user", content: user_message }
    ];

    const response_stream = await openai.chat.completions.create({
      model: envs.openai_language_model,
      messages,
      tools: openai_tools.length > 0 ? openai_tools : undefined,
      stream: true,
    });

    let tool_calls_buffer: any[] = [];
    let is_tool_call = false;
    let full_assistant_content = "";

    for await (const chunk of response_stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.tool_calls) {
        is_tool_call = true;
        for (const tc of delta.tool_calls) {
          if (!tool_calls_buffer[tc.index]) {
            tool_calls_buffer[tc.index] = tc;
          } else {
            if (tc.function?.arguments) {
              tool_calls_buffer[tc.index].function.arguments += tc.function.arguments;
            }
          }
        }
      }
      else if (!is_tool_call && delta.content) {
        full_assistant_content += delta.content;
        yield delta.content;
      }
    }

    if (!is_tool_call || tool_calls_buffer.length === 0) {
      return;
    }

    messages.push({
      role: "assistant",
      content: full_assistant_content || null,
      tool_calls: tool_calls_buffer as any
    });

    for (const tool_call of tool_calls_buffer) {
      const function_name = tool_call.function.name;
      const function_args = JSON.parse(tool_call.function.arguments);

      console.log(`Ejecutando herramienta MCP: ${function_name}`, function_args);

      try {
        const result = await client.callTool({ name: function_name, arguments: function_args });

        const content_array: any[] = Array.isArray(result.content) ? result.content : [];
        const tool_text_result = content_array
          .filter(c => c && c.type === "text")
          .map(c => (c as any).text)
          .join("\n");

        messages.push({ role: "tool", tool_call_id: tool_call.id, content: tool_text_result });
      } catch (error: any) {
        console.error(`Error en tool: ${function_name}`, error);
        messages.push({ role: "tool", tool_call_id: tool_call.id, content: `Falló: ${error.message}` });
      }
    }

    const final_response_stream = await openai.chat.completions.create({
      model: envs.openai_tool_model,
      messages,
      stream: true
    });

    for await (const chunk of final_response_stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield delta.content;
      }
    }
  }
}