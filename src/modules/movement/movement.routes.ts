import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { movement_service } from "./movement.service";
import { CreateMovementDtoSchema, ReadMovementDtoSchema, UpdateMovementDtoSchema } from "./movement.dto";
import { IdSchema } from "~/helpers/types";

export const movement_routes = new Elysia({
	prefix: "/movement",
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await movement_service.get(query);
	}, {
		auth: { verified: false },
		query: ReadMovementDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await movement_service.get_one(params.id);
	}, {
		auth: { verified: false },
		params: IdSchema,
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
		body: UpdateMovementDtoSchema,
		params: IdSchema,
	})

	.delete("/:id", async ({ params }) => {
		return await movement_service.delete(params.id);
	}, {
		auth: true,
		permission: "MOVEMENT",
		params: IdSchema,
	});
