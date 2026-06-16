import Elysia from "elysia";
import { IdSchema } from "~/helpers/types";
import { plugin_auth } from "~/plugins/auth";
import { CreateSaleDtoSchema, ReadSaleDtoSchema, UpdateSaleDtoSchema } from "./sale.dto";
import { sale_service } from "./sale.service";
import { bill_service } from "../bill/bill.service";

export const sale_routes = new Elysia({
	prefix: "/sale",
})
	.use(plugin_auth)

	.get("/", async ({ query }) => {
		return sale_service.find(query);
	}, {
		auth: { verified: false },
		role: ["superuser", "admin", "employer"],
		query: ReadSaleDtoSchema,
	})

	.post("/", async ({ body }) => {
		return await sale_service.create(body);
	}, {
		auth: true,
		permission: "SALE",
		role: ["superuser", "admin", "employer"],
		body: CreateSaleDtoSchema,
	})

	.get("/:id", async ({ params }) => {
		return await sale_service.find_one(params.id);
	}, {
		auth: { verified: false },
		
		params: IdSchema,
	})

	.patch("/:id", async ({ body, params }) => {
		return await sale_service.update(params.id, body);
	}, {
		auth: true,
		permission: "SALE",
		role: ["superuser", "admin", "employer"],
		body: UpdateSaleDtoSchema,
		params: IdSchema,
	})

	.post("/:id/bill", async ({ params }) => {
		const sale = await sale_service.find_one(params.id);
		const { bill } = await bill_service.generate(sale);
		await sale_service.update_bill(params.id, bill);
		return { bill };
	}, {
		auth: true,
		permission: "SALE",
		role: ["superuser", "admin", "employer"],
		params: IdSchema,
	})

	.get("/:id/bill", async ({ params }) => {
		const sale = await sale_service.find_one(params.id);
		return await bill_service.get(sale);
	}, {
		auth: { verified: false },
		
		params: IdSchema,
	});
