import Elysia from "elysia";
import { customer_service } from "./customer.service";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { CreateCustomerDtoSchema, ReadCustomerDtoSchema } from "./customer.dto";

export const customer_routes = new Elysia({
	prefix: "/customer"
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await customer_service.find(query);
	}, {
		auth: true,
		query: ReadCustomerDtoSchema
	})

	.get("/:id", async ({ params }) => {
		return await customer_service.find_one(params.id);
	}, {
		auth: true,
		params: z.object({
			id: z.coerce.number()
		})
	})

	.post("/", async ({ body }) => {
		return await customer_service.create(body);
	}, {
		auth: true,
		permission: "CUSTOMER",
		body: CreateCustomerDtoSchema
	})

	.patch("/:id/disable", async ({ params }) => {
		return await customer_service.toggle_disabled(params.id);
	}, {
		auth: true,
		permission: "CUSTOMER",
		params: z.object({
			id: z.coerce.number()
		})
	})

	.delete("/:id", async ({ params }) => {
		return await customer_service.delete(params.id);
	}, {
		auth: true,
		permission: "CUSTOMER",
		params: z.object({
			id: z.coerce.number()
		})
	});
