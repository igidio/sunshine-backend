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
import { category_routes } from "./modules/category/category.routes";
import { movement_routes } from "./modules/movement/movement.routes";
import { treatment_routes } from "./modules/treatment/treatment.routes";
import { user_routes } from "./modules/user/user.routes";
import { customer_routes } from "./modules/customer/customer.routes";
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
  .use(category_routes)
  .use(movement_routes)
  .use(treatment_routes)
  .use(user_routes)
  .use(customer_routes)
  .get("/", () => "Hello Elysia").listen(envs.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);