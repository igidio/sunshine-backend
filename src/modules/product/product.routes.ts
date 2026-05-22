import Elysia from "elysia";
import { product_service } from "./product.service";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { CreateProductDtoSchema, ReadProductDtoSchema } from "./product.dto";
import { error_messages } from "~/data/error_messages";
import { ForceArrayPreprocess } from "~/helpers/types";

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
		params: z.object({
			id: z.coerce.number()
		})
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
		body: z.object({
			images_to_remove: ForceArrayPreprocess(z.coerce.number()).optional(),
		}).extend(CreateProductDtoSchema.shape).partial(),
		params: z.object({
			id: z.coerce.number()
		})
	})

	.delete("/:id", async ({ params }) => {
		return await product_service.delete(params.id);
	}, {
		auth: true,
		permission: "PRODUCT",
		params: z.object({
			id: z.coerce.number()
		})
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
		body: z.object({
			status: z.enum(["disable", "enable"]).optional()
		}).optional(),
		params: z.object({
			id: z.coerce.number()
		})
	})


export default product_routes;