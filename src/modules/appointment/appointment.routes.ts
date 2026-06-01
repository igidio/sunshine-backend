import Elysia from "elysia";
import { IdSchema } from "~/helpers/types";
import { plugin_auth } from "~/plugins/auth";
import { appointment_service } from "./appointment.service";
import { CreateAppointmentDtoSchema, ReadAppointmentDtoSchema, UpdateAppointmentDtoSchema } from "./appointment.dto";

export const appointment_routes = new Elysia({
	prefix: "/appointment",
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await appointment_service.find(query);
	}, {
		auth: true,
		query: ReadAppointmentDtoSchema,
	})

	.post("/", async ({ body }) => {
		return await appointment_service.create(body);
	}, {
		auth: true,
		permission: "APPOINTMENT",
		body: CreateAppointmentDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await appointment_service.find_one(params.id);
	}, {
		auth: true,
		params: IdSchema,
	})

	.patch("/:id", async ({ body, params }) => {
		return await appointment_service.update(params.id, body);
	}, {
		auth: true,
		role: ["superuser", "admin", "employer"],
		permission: "APPOINTMENT",
		body: UpdateAppointmentDtoSchema,
		params: IdSchema,
	})

	.delete("/:id", async ({ params }) => {
		return await appointment_service.delete(params.id);
	}, {
		auth: true,
		role: ["superuser", "admin", "employer"],
		permission: "APPOINTMENT",
		params: IdSchema,
	});