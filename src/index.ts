import { Elysia } from "elysia";
import { envs } from "./config/envs";
import { plugin_error } from "./plugins/error";
import { auth_routes } from "./modules/auth/auth.routes";
import product_routes from "./modules/product/product.routes";
import { chat_routes } from "./modules/chat/chat.routes";
import plugin_mcp from "./plugins/mcp";
const app = new Elysia()
  .error({
    Error
  })
  .use(plugin_error)
  .use(plugin_mcp)
  .use(auth_routes)
  .use(product_routes)
  .use(chat_routes)
  .get("/", () => "Hello Elysia").listen(envs.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);