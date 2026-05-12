import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"
import Elysia from "elysia"
import { mcp } from "elysia-mcp"
import { registerCalculateTool } from "~/mcp/server"

const plugin_mcp = new Elysia()
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
			enableLogging: false,
			enableJsonResponse: true,
			setupServer: async (server: McpServer) => {
				registerCalculateTool(server)
			},
		}))
		
export default plugin_mcp;