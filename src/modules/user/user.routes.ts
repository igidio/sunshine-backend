import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import z from "zod";
import { user_service } from "./user.service";
import {
	ReadUserDtoSchema,
	UpdateUserDtoSchema,
	ToggleDisabledUserDtoSchema,
	SetPermissionsUserDtoSchema
} from "./user.dto";
import { IdSchema } from "~/helpers/types";

export const user_routes = new Elysia({
	prefix: "/user",
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await user_service.find(query);
	}, {
		auth: true,
		query: ReadUserDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await user_service.find_one(params.id);
	}, {
		auth: true,
		params: IdSchema,
	})

	.patch("/:id", async ({ body, params }) => {
		return await user_service.update(params.id, body);
	}, {
		auth: true,
		body: UpdateUserDtoSchema,
		params: IdSchema,
	})

	.put("/:id/toggle", async ({ body, params }) => {
		return await user_service.toggle_disabled(params.id, body);
	}, {
		auth: true,
		role: ["superuser", "admin"],
		body: ToggleDisabledUserDtoSchema,
		params: IdSchema,
	})

	.patch("/:id/permissions", async ({ body, params }) => {
		return await user_service.set_permissions(params.id, body);
	}, {
		auth: true,
		role: ["superuser", "admin"],
		body: SetPermissionsUserDtoSchema,
		params: IdSchema,
	});