import Elysia from "elysia";
import { product_service } from "./product.service";

export const product_routes = new Elysia({
	prefix: "/product"
}).get("/", async (ctx) => {
	return await product_service.get_all_products()
}).post("/", async ({ body, set }) => {
	return await product_service.create_product(body)
}).get("/:id", async ({ params }) => {
	return await product_service.get_product_by_id(params.id)
}).put("/:id", async ({ params, body }) => {
	return await product_service.update_product_by_id(params.id, body)
}).delete("/:id", async ({ params }) => {
	return await product_service.delete_product_by_id(params.id)
})

export default product_routes;