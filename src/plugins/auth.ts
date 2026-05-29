import bearer from "@elysia/bearer";
import Elysia from "elysia";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { permissions } from "~/data/permissions";
import { auth_service } from "~/modules/auth/auth.service";
import { user_service } from "~/modules/user/user.service";
import type { UserRole } from "~/modules/user/user.schema";
import plugin_jwt from "~/plugins/jwt";

export const plugin_auth = new Elysia()
	.use(plugin_jwt)
	.use(bearer())
	.macro({
		auth: {
			resolve: async ({ jwt, bearer }) => {
				if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
				const auth_header = await jwt.verify(bearer);
				if (!auth_header) throw new ServerError(error_messages.invalid_token, 401);

				return { user: auth_header };
			},
		},
		role: (allowed_roles: UserRole[]) => ({
			resolve: async ({ jwt, bearer }) => {
				const payload = await auth_service.get_authenticated_user(bearer!, jwt);
				const user_role = payload.user.role as UserRole;
				
				if (!allowed_roles.includes(user_role)) {
					throw new ServerError(error_messages.user_forbidden, 403);
				}
				
				return { user: payload.user };
			}
		}),
		permission: (permission: typeof permissions[number]) => ({
			resolve: async ({jwt, bearer }) => {
				const payload = await auth_service.get_authenticated_user(bearer!, jwt);
				const has_permission = await user_service.check_permissions(payload.user.id, permission);
				if (!has_permission) {
					throw new ServerError(error_messages.user_forbidden, 403);
				}
				return { user: payload.user };
			}
		})
	})