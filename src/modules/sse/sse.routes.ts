import Elysia, { sse, type SSEPayload } from "elysia";
import { notification_broadcaster } from "~/helpers/event_bus";

export const notification_routes = new Elysia({
	prefix: "/sse"
}).get("/", async function* () {
	yield sse("Conexión establecida");
	const queue: (string | SSEPayload)[] = [];
	const unsubscribe = notification_broadcaster.subscribe((msg) => {
		queue.push(msg);
	});

	try {
		let ticker = 0;
		while (true) {
			ticker += 1;
			if (queue.length > 0) {
				const message = queue.shift();
				console.log(`Enviando notificación SSE: ${message}`);
				
				yield sse(message!);
			}
			if (ticker == 270) {
				yield sse("ping");
				ticker = 0;
			}
			await Bun.sleep(100);
		}
	} catch {
		throw new Error("Error en la conexión SSE");
	} finally {
		unsubscribe();
	}
});