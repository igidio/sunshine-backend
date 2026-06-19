import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { envs } from "~/config/envs";
import { VercelAiOrchestrator } from "~/modules/chat/vercel_ai-orchestrator";
import type { ChatMessage } from "../chat/vercel_ai-orchestrator";
import { error_messages } from "~/data/error_messages";
import { user_service } from "~/modules/user/user.service";
import { ServerError } from "~/classes/server_error";

const system_prompt = 'No vas a formatear el texto como si fuese Markdown ni nada, solo envíame la respuesta en texto plano. También si el uso de tools falla tienes que recordar al usuario que es posible que no esté autenticado y que debe usar el comando /link para vincular su cuenta de Telegram con Sunshine.'
const chat_histories = new Map<number, ChatMessage[]>();
export function create_telegram_plugin() {
	if (!envs.telegram_bot_token) {
		console.warn(error_messages.telegram_bot_token_not_defined);
		return null;
	}

	const bot = new Telegraf(envs.telegram_bot_token);
	const orchestrator = new VercelAiOrchestrator();

	bot.start(async (ctx) => {
		chat_histories.set(ctx.chat.id, []);
		return await ctx.reply("¡Bienvenido! Soy el asistente de Sunshine. ¿En qué puedo ayudarte?");
	});

	bot.help((ctx) => {
		return ctx.reply(
			"ℹEnvíame cualquier pregunta y usaré las herramientas disponibles para responderte.\n\n" +
			"/link <código> — Vincular tu cuenta de Telegram con Sunshine\n" +
			"/logout — Desvincular tu cuenta de Telegram\n" +
			"/clear — Limpiar historial de conversación\n" +
			"/start — Reiniciar el bot"
		);
	});

	bot.command("clear", (ctx) => {
		chat_histories.set(ctx.chat.id, []);
		return ctx.reply("Historial limpiado.");
	});

	bot.command("link", async (ctx) => {
		const chat_access_key = ctx.message.text.split(" ")[1];

		if (!chat_access_key) {
			return ctx.reply("Debes proporcionar un código de acceso. Ejemplo: /link abc123");
		}

		try {
			const user = await user_service.link_telegram(chat_access_key, ctx.from.id.toString());
			chat_histories.set(ctx.chat.id, []);
			return ctx.reply(`¡Cuenta vinculada exitosamente! Bienvenido, ${user.username}.`);
		} catch (error) {
			if (error instanceof ServerError) {
				return ctx.reply(`${error.message}`);
			}
			return ctx.reply("Hubo un error al vincular tu cuenta. Intenta de nuevo.");
		}
	});

	bot.command("logout", async (ctx) => {
		try {
			const user = await user_service.unlink_telegram(ctx.from.id.toString());
			chat_histories.set(ctx.chat.id, []);
			return ctx.reply(`¡Cuenta desvinculada exitosamente! Hasta luego, ${user.username}.`);
		} catch (error) {
			if (error instanceof ServerError) {
				return ctx.reply(`${error.message}`);
			}
			return ctx.reply("Hubo un error al desvincular tu cuenta. Intenta de nuevo.");
		}
	});

	bot.on(message("text"), async (ctx) => {
		const chat_id = ctx.chat.id;
		const user_message = ctx.message.text;

		if (!chat_histories.has(chat_id)) {
			chat_histories.set(chat_id, []);
		}
		const history = chat_histories.get(chat_id)!;

		history.push({ role: "user", content: user_message });

		try {
			await ctx.sendChatAction("typing");

			const result = await orchestrator.handle_chat(
				history,
				{
					"x-chat-source": "telegram",
					"x-chat-id": chat_id.toString()
				},
				system_prompt
			);
			const reply = result.text;

			history.push({ role: "assistant", content: reply });

			if (reply.length <= 4096) {
				await ctx.reply(reply);
			} else {
				const chunks = reply.match(/.{1,4090}/gs) || [reply];
				for (const chunk of chunks) {
					await ctx.reply(chunk);
				}
			}
		} catch (error: any) {
			await ctx.reply("Hubo un error procesando tu mensaje. Intenta de nuevo.");
		}
	});

	return bot;
}