import { connect, type NatsConnection } from "nats";
import { envs } from "~/config/envs";

let nc: NatsConnection | null = null;

export const transporter = {
	/**
	 * Initialize the NATS connection to the mailer microservice.
	 */
	connect: async (): Promise<NatsConnection> => {
		if (nc) return nc;

		nc = await connect({
			servers: envs.mailer_url || "nats://localhost:4222",
		});

		console.log(`✅ NATS connected to ${nc.getServer()}`);
		return nc;
	},

	/**
	 * Emit an email.send event to the mailer microservice via NATS.
	 */
	emit_to_mail_microservice: async ({
		type,
		data,
	}: {
		type: string;
		data: Record<string, unknown>;
	}) => {
		const connection = await transporter.connect();
		connection.publish(
			"email.send",
			JSON.stringify({ type, data })
		);
	},

	/**
	 * Close the NATS connection gracefully.
	 */
	close: async () => {
		if (nc) {
			await nc.drain();
			nc = null;
		}
	},
};
