import { beforeEach } from "bun:test";
import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";

export const notification_routes = new Elysia({
	prefix: "/notification"
})
	.use(plugin_auth)

	.get("/", ({ user }) => {
		return user.id;
	}, {
		auth: true,
	})