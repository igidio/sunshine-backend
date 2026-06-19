import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"
import Elysia from "elysia"
import { mcp } from "elysia-mcp"
import { registerCalculateTool } from "~/mcp/server"
import { register_products_tools } from "~/modules/product/product.mcp"
import { register_categories_tools } from "~/modules/category/category.mcp"
import { register_confirmations_tools } from "~/modules/confirmation/confirmation.mcp"
import { register_customers_tools } from "~/modules/customer/customer.mcp"
import { register_dashboard_tools } from "~/modules/dashboard/dashboard.mcp"
import { register_movements_tools } from "~/modules/movement/movement.mcp"
import { register_profiles_tools } from "~/modules/profile/profile.mcp"
import { register_sales_tools } from "~/modules/sale/sale.mcp"
import { register_stock_tools } from "~/modules/stock/stock.mcp"
import { register_suppliers_tools } from "~/modules/supplier/supplier.mcp"
import { register_treatments_tools } from "~/modules/treatment/treatment.mcp"
import { register_users_tools } from "~/modules/user/user.mcp"
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
		let authenticated_user = undefined;

		if (headers["x-chat-source"] === "telegram" && headers["x-chat-id"]) {
			const cache_key = `telegram:${headers["x-chat-id"]}`;
			const cached = mcp_auth_cache.get(cache_key);
			if (cached) return { user: cached };
			const user = await user_service.find_by_telegram_id(headers["x-chat-id"]!)

			if (user) {
				mcp_auth_cache.set(cache_key, user);
				authenticated_user = user;
				return { user: authenticated_user };
			} else {
				return { user: undefined }
			}
		}

		if (headers["x-api-key"] && headers["x-api-key"].length >= 32) {
			const cache_key = `apikey:${headers["x-api-key"]}`;
			const cached = mcp_auth_cache.get(cache_key);
			if (cached) return { user: cached };

			const user = await user_service.find_by_chat_access(headers["x-api-key"]);
			if (user) {
				mcp_auth_cache.set(cache_key, user);
				authenticated_user = user;
				return { user: authenticated_user };
			} else {
				return { user: undefined }
			}
		}

		if (headers["authorization"] && bearer) {
			const cache_key = `jwt:${bearer}`;
			const cached = mcp_auth_cache.get(cache_key);
			if (cached) return { user: cached };

			const payload = await jwt.verify(bearer);
			if (payload) {
				const user = await user_service.find_one(payload.id);
				if (user && !user.disabled_at) {
					mcp_auth_cache.set(cache_key, user);
					authenticated_user = user;
					return { user: authenticated_user };
				} else {
					return { user: undefined }
				}
			}
		}

		return { user: undefined }
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
				if (["tools/list", "notifications/initialized", "ping", "initialize"].includes((context.body as any)?.method)) {
					return {};
				}

				const user = (context as any).user ?? undefined;

				const error_response = {
					response: {
						jsonrpc: "2.0",
						id: null,
						error: { code: -32600, message: error_messages.mcp_unauthorized }
					}
				}

				if (!user) {
					return error_response;
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
				register_categories_tools(server)
				register_confirmations_tools(server)
				register_customers_tools(server)
				register_dashboard_tools(server)
				register_movements_tools(server)
				register_profiles_tools(server)
				register_sales_tools(server)
				register_stock_tools(server)
				register_suppliers_tools(server)
				register_treatments_tools(server)
				register_users_tools(server)
			},
		}))

export default plugin_mcp;