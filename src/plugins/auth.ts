import bearer from "@elysia/bearer";
import Elysia from "elysia";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import plugin_jwt from "~/plugins/jwt";

export const plugin_auth = new Elysia()
	.use(plugin_jwt)
	.use(bearer())
	.macro({

		auth: {
			resolve: async ({ jwt, bearer }) => {
				if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
				const auth_header = await jwt.verify(bearer);
				if (!auth_header) throw new ServerError(error_messages.invalid_token, 400);

				return { user: auth_header };
			},
		}


	})