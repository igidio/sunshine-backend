import { beforeEach } from "bun:test";
import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { notification_service } from "./notification.service";
import z from "zod";

export const notification_routes = new Elysia({
	prefix: "/notification"
})
	.use(plugin_auth)

	.get("/", ({ user, query }) => {
		return notification_service.get(user.id, query);
	}, {
		query: z.object({
			limit: z.coerce.number().optional().default(10),
			offset: z.coerce.number().optional().default(0),
		}),
		auth: true,
	})