import jwt from "@elysia/jwt";
import Elysia from "elysia";
import { envs } from "~/config/envs";

const plugin_jwt = new Elysia()
	.use(jwt({
		name: "jwt",
		secret: envs.jwt_secret,
		exp: "1h"
	}))

export default plugin_jwt;