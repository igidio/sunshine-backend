import { Elysia } from "elysia";
import { envs } from "./config/envs";
import product_routes from "./api/product/product.routes";
import { auth_routes } from "./api/auth/auth.routes";
import { plugin_error } from "./plugins/error";

const app = new Elysia()
.error({
  Error
})
  .use(plugin_error)
  .use(auth_routes)
  .use(product_routes)
  .get("/", () => "Hello Elysia").listen(envs.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);