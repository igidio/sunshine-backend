import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { supplier_service } from "./supplier.service";

export const supplier_routes = new Elysia({
	prefix: "/supplier"
})
	.use(plugin_auth)

	.get("/", ({ user }) => {
		return supplier_service.get();
	}, {
		auth: true,
	})