import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { dashboard_service } from "./dashboard.service";

export const dashboard_routes = new Elysia({
	prefix: "/dashboard",
})
	.use(plugin_auth)

	.get("/", async () => {
		return dashboard_service.get();
	}, {
		auth: { verified: false },
		role: ["superuser", "admin", "employer"],
	});
