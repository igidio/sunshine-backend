import Elysia from "elysia";
import { product_service } from "./product.service";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { CreateProductDtoSchema, ImagesToRemoveDtoSchema, ReadProductDtoSchema } from "./product.dto";
import { error_messages } from "~/data/error_messages";
import { IdSchema, StatusSchemaDto, ToggleStatusSchemaDto } from "~/helpers/types";

export const product_routes = new Elysia({
	prefix: "/product"
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await product_service.find_all(query)
	}, {
		auth: true,
		query: ReadProductDtoSchema
	})

	.get("/:id", async ({ params }) => {
		return await product_service.find_one(params.id)
	}, {
		auth: true,
		params: IdSchema
	})

	.post("/", async ({ body }) => {
		return await product_service.create(body);
	}, {
		auth: true,
		permission: "PRODUCT",
		body: CreateProductDtoSchema
	})

	.patch("/:id", async ({ body, params }) => {
		return await product_service.update(params.id, body);
	}, {
		auth: true,
		permission: "PRODUCT",
		body: ImagesToRemoveDtoSchema,
		params: IdSchema
	})

	.delete("/:id", async ({ params }) => {
		return await product_service.delete(params.id);
	}, {
		auth: true,
		permission: "PRODUCT",
		params: IdSchema
	})

	.patch("/:id/disable", async ({ body, params }) => {
		let status: "disable" | "enable";

		if (!body || !body.status) {
			const product = await product_service.find_one(params.id);
			if (!product) throw new Error(error_messages.product_not_found);
			status = product.disabled_at ? "enable" : "disable";
		} else {
			status = body.status;
		}

		return await product_service.toggle_disable(params.id, status === "disable");
	}, {
		auth: true,
		permission: "PRODUCT",
		body: ToggleStatusSchemaDto.optional(),
		params: IdSchema
	})


export default product_routes;