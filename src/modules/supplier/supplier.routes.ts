import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { supplier_service } from "./supplier.service";
import { CreateSupplierDtoSchema, ReadSupplierDtoSchema, UpdateSupplierDtoSchema } from "./supplier.dto";
import { error_messages } from "~/data/error_messages";
import { IdSchema, ToggleStatusSchemaDto } from "~/helpers/types";

export const supplier_routes = new Elysia({
	prefix: "/supplier"
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return await supplier_service.get(query);
	}, {
		auth: { verified: false },
		query: ReadSupplierDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await supplier_service.get_one(params.id);
	}, {
		auth: { verified: false },
		params: IdSchema
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
		let image_url: string | null | undefined = undefined;

		if (image || !body.keep_image) {
			image_url = await supplier_service.update_image(image);
		}
		return await supplier_service.update(params.id, { ...service_body, image_url });
	}, {
		auth: true,
		permission: "SUPPLIER",
		body: UpdateSupplierDtoSchema,
		params: IdSchema
	})


	.delete("/:id", async ({ params }) => {
		return await supplier_service.delete(params.id);
	}, {
		auth: true,
		permission: "SUPPLIER",
		params: IdSchema
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
		body: ToggleStatusSchemaDto.optional(),
		params: IdSchema
	})