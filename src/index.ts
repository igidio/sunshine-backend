import { Elysia } from "elysia";
import { envs } from "./config/envs";
import product_routes from "./api/products/products.routes";

const app = new Elysia()
.use(product_routes)
.get("/", () => "Hello Elysia").listen(envs.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);