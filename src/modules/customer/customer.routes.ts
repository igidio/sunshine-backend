import Elysia from "elysia";
import { customer_service } from "./customer.service";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { CreateCustomerDtoSchema, ReadCustomerDtoSchema, UpdateCustomerDtoSchema, ToggleDisabledCustomerDtoSchema } from "./customer.dto";
import { IdSchema } from "~/helpers/types";

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
		params: IdSchema
	})

	.patch("/:id", async ({ params, body }) => {
		return await customer_service.update(params.id, body);
	}, {
		auth: true,
		permission: "CUSTOMER",
		params: IdSchema,
		body: UpdateCustomerDtoSchema,
	})

	.post("/", async ({ body }) => {
		return await customer_service.create(body);
	}, {
		auth: true,
		permission: "CUSTOMER",
		body: CreateCustomerDtoSchema
	})

	.patch("/:id/disable", async ({ params, body }) => {
		return await customer_service.toggle_disabled(params.id, body.disabled);
	}, {
		auth: true,
		permission: "CUSTOMER",
		params: IdSchema,
		body: ToggleDisabledCustomerDtoSchema,
	})

	.delete("/:id", async ({ params }) => {
		return await customer_service.delete(params.id);
	}, {
		auth: true,
		permission: "CUSTOMER",
		params: IdSchema
	});
