import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { supplier_service } from "./supplier.service";
import z from "zod";

export const supplier_routes = new Elysia({
	prefix: "/supplier"
})
	.use(plugin_auth)

	.get("/", ({ user }) => {
		return supplier_service.get();
	}, {
		auth: true,
	})

	.post("/", ({ body }) => {
		return supplier_service.create(body);
	}, {
		auth: true,
		permission: "SUPPLIER",
		body: z.object({
			name: z.string().max(255),
			email: z.email(),
			phone_number: z.string().max(20),
			address: z.string().max(255),
			description: z.string().max(1000),
		}),
	})