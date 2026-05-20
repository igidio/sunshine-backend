import { Elysia } from "elysia";
import { envs } from "./config/envs";
import { plugin_error } from "./plugins/error";
import { auth_routes } from "./modules/auth/auth.routes";
import product_routes from "./modules/product/product.routes";
import { chat_routes } from "./modules/chat/chat.routes";
import plugin_mcp from "./plugins/mcp";
import { sse_routes } from "./modules/sse/sse.routes";
import { notification_routes } from "./modules/notification/notification.routes";
import { supplier_routes } from "./modules/supplier/supplier.routes";
import staticPlugin from "@elysiajs/static";
const app = new Elysia()
  .error({ Error })
  .use(staticPlugin({
    assets: "public",
    prefix: "/"
  }))
  .use(plugin_error)
  .use(plugin_mcp)
  .use(auth_routes)
  .use(product_routes)
  .use(chat_routes)
  .use(sse_routes)
  .use(notification_routes)
  .use(supplier_routes)
  .get("/", () => "Hello Elysia").listen(envs.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);