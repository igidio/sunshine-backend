import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { category_service } from "./category.service";
import z from "zod";
import { CreateCategoryDtoSchema, ReadCategoryDtoSchema } from "./category.dto";

export const category_routes = new Elysia({
	prefix: "/category"
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await category_service.get(query);
	}, {
		auth: { verified: false },
		query: ReadCategoryDtoSchema
	})

	.get("/:id", async ({ params }) => {
		return await category_service.get_one(params.id);
	}, {
		auth: { verified: false },
		params: z.object({
			id: z.coerce.number()
		})
	})

	.post("/", async ({ body }) => {
		return await category_service.create(body);
	}, {
		auth: true,
		permission: "CATEGORY",
		body: CreateCategoryDtoSchema
	})

	.patch("/:id", async ({ body, params }) => {
		return await category_service.update(params.id, body);
	}, {
		auth: true,
		permission: "CATEGORY",
		body: CreateCategoryDtoSchema.partial(),
		params: z.object({
			id: z.coerce.number()
		})
	})

	.delete("/:id", async ({ params }) => {
		return await category_service.delete(params.id);
	}, {
		auth: true,
		permission: "CATEGORY",
		params: z.object({
			id: z.coerce.number()
		})
	});