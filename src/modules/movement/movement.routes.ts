import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { movement_service } from "./movement.service";
import { CreateMovementDtoSchema, ReadMovementDtoSchema } from "./movement.dto";

export const movement_routes = new Elysia({
	prefix: "/movement",
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await movement_service.get(query);
	}, {
		auth: true,
		query: ReadMovementDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await movement_service.get_one(params.id);
	}, {
		auth: true,
		params: z.object({
			id: z.coerce.number(),
		}),
	})

	.post("/", async ({ body }) => {
		return await movement_service.create(body);
	}, {
		auth: true,
		permission: "MOVEMENT",
		body: CreateMovementDtoSchema,
	})

	.patch("/:id", async ({ body, params }) => {
		return await movement_service.update(params.id, body);
	}, {
		auth: true,
		permission: "MOVEMENT",
		body: CreateMovementDtoSchema.partial(),
		params: z.object({
			id: z.coerce.number(),
		}),
	})

	.delete("/:id", async ({ params }) => {
		return await movement_service.delete(params.id);
	}, {
		auth: true,
		permission: "MOVEMENT",
		params: z.object({
			id: z.coerce.number(),
		}),
	});
