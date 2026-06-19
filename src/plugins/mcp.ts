import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"
import Elysia from "elysia"
import { mcp } from "elysia-mcp"
import { registerCalculateTool } from "~/mcp/server"
import { register_products_tools } from "~/modules/product/product.mcp"
import { register_categories_tools } from "~/modules/category/category.mcp"
import { register_confirmations_tools } from "~/modules/confirmation/confirmation.mcp"
import { register_customers_tools } from "~/modules/customer/customer.mcp"
import { register_appointments_tools } from "~/modules/appointment/appointment.mcp"
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
		const authenticate = async (
			cache_key: string,
			fetch_user: () => Promise<user_select | null | undefined>
		): Promise<{ user: user_select | undefined }> => {
			const cached = mcp_auth_cache.get(cache_key);
			if (cached) return { user: cached };

			try {
				const user = await fetch_user();
				if (!user) return { user: undefined };

				await user_service.check_authenticated_user({
					is_verified: true,
					is_disabled: true,
					user,
				}).catch(() => {
					return { user: undefined };
				});
				mcp_auth_cache.set(cache_key, user);
				return { user: user };
			} catch {
				return { user: undefined };
			}
		};

		if (headers["x-chat-source"] === "telegram" && headers["x-chat-id"]) {
			const chat_id = headers["x-chat-id"]!;
			return authenticate(
				`telegram:${headers["x-chat-id"]}`,
				() => user_service.find_by_telegram_id(chat_id!)
			);
		}

		if (headers["x-api-key"] && headers["x-api-key"].length >= 32) {
			const api_key = headers["x-api-key"]!;
			return authenticate(
				`apikey:${headers["x-api-key"]}`,
				() => user_service.find_by_chat_access(api_key)
			);
		}

		if (headers["authorization"] && bearer) {
			return authenticate(
				`jwt:${bearer}`,
				async () => {
					const payload = await jwt.verify(bearer);
					if (!payload) return null;
					return user_service.find_one(payload.id);
				}
			);
		}

		return { user: undefined };
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
				register_appointments_tools(server)
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