import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { envs } from "~/config/envs";
import { ChatOrchestrator } from "../chat/orchestrator";

const chat_histories = new Map<number, { role: string; content: string }[]>();

export function create_telegram_plugin() {
	if (!envs.telegram_bot_token) {
		console.warn("⚠️  TELEGRAM_BOT_TOKEN no definido. Telegram bot deshabilitado.");
		return null;
	} else {
		console.log("✅ TELEGRAM_BOT_TOKEN encontrado. Telegram bot habilitado.");
	}
	console.log(envs.telegram_bot_token);

	const bot = new Telegraf(envs.telegram_bot_token);
	const orchestrator = new ChatOrchestrator();

	bot.start(async (ctx) => {
		console.log("sffdasd");

		chat_histories.set(ctx.chat.id, []);
		return await ctx.reply("👋 ¡Bienvenido! Soy el asistente de Sunshine. ¿En qué puedo ayudarte?");
	});

	bot.help((ctx) => {
		return ctx.reply(
			"ℹ️ Envíame cualquier pregunta y usaré las herramientas disponibles para responderte.\n\n" +
			"/clear — Limpiar historial de conversación\n" +
			"/start — Reiniciar el bot"
		);
	});

	bot.command("clear", (ctx) => {
		console.log("Clearing chat history for user:", ctx.chat.id);
		chat_histories.set(ctx.chat.id, []);
		return ctx.reply("🗑️ Historial limpiado.");
	});

	bot.on(message("text"), async (ctx) => {
		const chat_id = ctx.chat.id;
		const user_message = ctx.message.text;

		// Obtener o crear historial
		if (!chat_histories.has(chat_id)) {
			chat_histories.set(chat_id, []);
		}
		const history = chat_histories.get(chat_id)!;

		// Agregar mensaje del usuario
		history.push({ role: "user", content: user_message });

		try {
			await ctx.sendChatAction("typing");

			const reply = await orchestrator.handle_chat(history);

			// Agregar respuesta al historial
			history.push({ role: "assistant", content: reply });

			// Telegram tiene límite de 4096 caracteres por mensaje
			if (reply.length <= 4096) {
				await ctx.reply(reply);
			} else {
				// Dividir en múltiples mensajes
				const chunks = reply.match(/.{1,4090}/gs) || [reply];
				for (const chunk of chunks) {
					await ctx.reply(chunk);
				}
			}
		} catch (error: any) {
			console.error("Telegram chat error:", error);
			await ctx.reply("❌ Hubo un error procesando tu mensaje. Intenta de nuevo.");
		}
	});

	return bot;
}