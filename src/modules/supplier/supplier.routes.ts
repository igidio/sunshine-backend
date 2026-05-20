import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { supplier_service } from "./supplier.service";
import z from "zod";
import { CreateSupplierDtoSchema, ReadSupplierDtoSchema } from "./supplier.dto";
import { error_messages } from "~/data/error_messages";

export const supplier_routes = new Elysia({
	prefix: "/supplier"
})
	.use(plugin_auth)

	.get("/", async ({ user, query }) => {
		return await supplier_service.get(query);
	}, {
		auth: true,
		query: ReadSupplierDtoSchema
	})

	.get("/:id", async ({ params }) => {
		return await supplier_service.get_one(params.id);
	}, {
		auth: true,
		params: z.object({
			id: z.coerce.number()
		})
	})

	.post("/", async ({ body }) => {
		const { image, ...service_body } = body;
		const image_url = await supplier_service.update_image(body.image);
		return supplier_service.create({ ...service_body, image_url });
	}, {
		auth: true,
		permission: "SUPPLIER",
		body: CreateSupplierDtoSchema
	})

	.patch("/:id", async ({ body, params }) => {
		const { image, ...service_body } = body;
		const image_url = await supplier_service.update_image(body.image);
		return await supplier_service.update(params.id, { ...service_body, image_url });
	}, {
		auth: true,
		permission: "SUPPLIER",
		body: CreateSupplierDtoSchema.partial(),
		params: z.object({
			id: z.string().transform(Number)
		})
	})


	.delete("/:id", async ({ params }) => {
		return await supplier_service.delete(params.id);
	}, {
		auth: true,
		permission: "SUPPLIER",
		params: z.object({
			id: z.string().transform(Number)
		})
	})

	.patch("/:id/disable", async ({ body, params }) => {
		let status: "disable" | "enable";

		if (!body || !body.status) {
			let supplier = await supplier_service.get_one(params.id)
			if (!supplier) throw new Error(error_messages.supplier_not_found);

			status = supplier.disabled_at ? "enable" : "disable";
		} else {
			status = body.status;
		}

		return await supplier_service.toggle_disable(params.id, status === "disable");
	}, {
		auth: true,
		permission: "SUPPLIER",
		body: z.object({
			status: z.enum(["disable", "enable"]).optional()
		}).optional(),
		params: z.object({
			id: z.coerce.number()
		})
	})