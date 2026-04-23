import { Elysia } from "elysia";
import { envs } from "./config/envs";

const app = new Elysia().get("/", () => "Hello Elysia").listen(envs.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);