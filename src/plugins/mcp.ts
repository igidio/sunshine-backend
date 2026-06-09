import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"
import Elysia from "elysia"
import { mcp } from "elysia-mcp"
import { registerCalculateTool } from "~/mcp/server"
import { register_products_tools } from "~/modules/product/product.mcp"
import plugin_jwt from "./jwt"
import bearer from "@elysia/bearer"
import { user_service } from "~/modules/user/user.service"
import type { user_select } from "~/modules/user/user.schema"
import { error_messages } from "~/data/error_messages"
import { create_cache } from "./cache"

const mcp_auth_cache = create_cache<user_select>(20_000, 60_000);

const plugin_mcp = new Elysia()
	.use(plugin_jwt)
	.use(bearer())
	.resolve(async ({ bearer, jwt, headers }) => {
		let user: user_select | null = null;

		if (bearer) {
			const cache_key = `jwt:${bearer}`;
			const cached = mcp_auth_cache.get(cache_key);
			if (cached) return { user: cached };

			const payload = await jwt.verify(bearer);
			if (payload) {
				const user = await user_service.find_one(payload.id);
				if (user && !user.disabled_at) {
					mcp_auth_cache.set(cache_key, user);
					return { user: user };
				}
			}
		}

		const api_key = headers["x-api-key"];
		if (api_key && api_key.length >= 32) {
			const cache_key = `apikey:${api_key}`;
			const cached = mcp_auth_cache.get(cache_key);
			if (cached) return { user: cached };

			const user = await user_service.find_by_chat_access(api_key);
			if (user) {
				mcp_auth_cache.set(cache_key, user);
				return { user };
			}
		}
		return { user };
	})
	.use(
		mcp({
			basePath: '/mcp',
			serverInfo: {
				name: 'sushine-mcp-server',
				version: '0.0.1',
			},
			capabilities: {
				tools: {},
				resources: {},
				prompts: {},
				logging: {},
			},
			authentication: async (context) => {
				const user = (context as any).user ?? null;

				if (!user) {
					return {
						response: {
							jsonrpc: "2.0",
							id: null,
							error: { code: -32600, message: error_messages.mcp_unauthorized }
						}
					};
				}
				return {
					authInfo: user
				}
			},
			enableLogging: false,
			enableJsonResponse: true,
			setupServer: async (server: McpServer) => {
				registerCalculateTool(server)
				register_products_tools(server)
			},


		}))

export default plugin_mcp;