import Elysia from "elysia";
import { product_service } from "./product.service";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { ReadProductDtoSchema } from "./product.dto";

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

	.post("/", async ({ body, set }) => {
		return await product_service.create_product(body)
	}).put("/:id", async ({ params, body }) => {
		return await product_service.update_product_by_id(params.id, body)
	}).delete("/:id", async ({ params }) => {
		return await product_service.delete_product_by_id(params.id)
	})

export default product_routes;