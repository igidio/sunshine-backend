import Elysia from "elysia";
import { create_telegram_plugin } from "./telegraf";
import { envs } from "~/config/envs";

export function setup_telegram_routes() {
	const telegram_bot = create_telegram_plugin();
	telegram_bot!.telegram.setWebhook(`${envs.server_url}/telegram/webhook`)

	return new Elysia({ prefix: '/telegram' })
		.post('/webhook', async ({ body }) => {
			await telegram_bot!.handleUpdate(body as any);
			return "ok";
		});
}