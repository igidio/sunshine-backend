import type { SSEPayload } from 'elysia';
import { EventEmitter } from 'events';
export const global_events = new EventEmitter();

type allowed_message = string | SSEPayload;

class NotificationBroadcaster {
	private clients = new Set<(msg: allowed_message) => void>();

	subscribe(callback: (msg: allowed_message) => void) {
		this.clients.add(callback);
		return () => this.clients.delete(callback);
	}

	broadcast(message: allowed_message) {
		this.clients.forEach(callback => callback(message));
	}
}

export const notification_broadcaster = new NotificationBroadcaster();

global_events.on('new_notification', (data) => {
	notification_broadcaster.broadcast({
		event: 'new_notification',
		data,
	});
});