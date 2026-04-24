import Elysia from "elysia";

export const product_routes = new Elysia({
	prefix: "/product"
}).get("/", async (ctx) => {
	return "Get all products"
}).post("/", async ({ body, set }) => {
	return "Create a new product"
}).get("/:id", async ({ params }) => {
	return `Get product with id ${params.id}`
}).put("/:id", async ({ params }) => {
	return `Update product with id ${params.id}`
}).delete("/:id", async ({ params }) => {
	return `Delete product with id ${params.id}`
})

export default product_routes;