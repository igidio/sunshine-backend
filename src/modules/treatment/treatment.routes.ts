import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { IdSchema } from "~/helpers/types";
import { treatment_service } from "./treatment.service";
import { CreateTreatmentDtoSchema, ReadTreatmentDtoSchema, ToggleDisabledTreatmentDtoSchema, UpdateTreatmentDtoSchema } from "./treatment.dto";

export const treatment_routes = new Elysia({
	prefix: "/treatment",
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await treatment_service.find(query);
	}, {
		auth: { verified: false },
		query: ReadTreatmentDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await treatment_service.find_one(params.id);
	}, {
		auth: { verified: false },
		params: IdSchema,
	})

	.post("/", async ({ body }) => {
		return await treatment_service.create(body);
	}, {
		auth: true,
		role: ["superuser", "admin", "employer"],
		permission: "TREATMENT",
		body: CreateTreatmentDtoSchema,
	})

	.patch("/:id", async ({ body, params }) => {
		return await treatment_service.update(params.id, body);
	}, {
		auth: true,
		role: ["superuser", "admin", "employer"],
		permission: "TREATMENT",
		body: UpdateTreatmentDtoSchema,
		params: IdSchema,
	})

	.put("/:id/toggle", async ({ body, params }) => {
		return await treatment_service.toggle_disabled(params.id, body);
	}, {
		auth: true,
		role: ["superuser", "admin", "employer"],
		permission: "TREATMENT",
		body: ToggleDisabledTreatmentDtoSchema.optional(),
		params: IdSchema,
	})

	.delete("/:id", async ({ params }) => {
		return await treatment_service.delete(params.id);
	}, {
		auth: true,
		role: ["superuser", "admin", "employer"],
		permission: "TREATMENT",
		params: IdSchema,
	});