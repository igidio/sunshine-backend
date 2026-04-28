import jwt from "@elysia/jwt";
import Elysia from "elysia";
import { envs } from "~/config/envs";

const plugin_jwt = new Elysia()
	.use(jwt({
		name: "jwt",
		secret: envs.jwt_secret,
		exp: "1h"
	}))
	.use(jwt({
		name: "jwt_refresh",
		secret: envs.jwt_refresh,
		exp: "7d"
	}))

export default plugin_jwt;