import jwt from "@elysia/jwt";
import Elysia from "elysia";
import { z } from "zod";
import { envs } from "~/config/envs";

const schema = z.object({
	id: z.number(),
	email: z.string(),
	username: z.string(),
	remember_me: z.boolean().optional(),
})

const plugin_jwt = new Elysia()
	.use(jwt({
		name: "jwt",
		secret: envs.jwt_secret,
		exp: "7d",
		schema
	}))
	.use(jwt({
		name: "jwt_refresh",
		secret: envs.jwt_refresh,
		exp: "7d",
		schema
	}))

export default plugin_jwt;