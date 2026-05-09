import { Elysia } from "elysia";
import { envs } from "./config/envs";
import { plugin_error } from "./plugins/error";
import { auth_routes } from "./modules/auth/auth.routes";
import product_routes from "./modules/product/product.routes";

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