import bearer from "@elysia/bearer";
import Elysia from "elysia";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import type { permissions } from "~/data/permissions";
import { user_service } from "~/modules/user/user.service";
import type { UserRole } from "~/modules/user/user.schema";
import plugin_jwt from "~/plugins/jwt";

export const plugin_auth = new Elysia()
	.use(plugin_jwt)
	.use(bearer())
	.derive({ as: 'scoped' }, async ({ jwt, bearer }) => {
		if (!bearer) throw new ServerError(error_messages.no_token_provided, 400);
		const payload = await jwt.verify(bearer);
		if (!payload) throw new ServerError(error_messages.invalid_token, 401);
		const user = await user_service.find_one(payload.id);
		if (!user) throw new ServerError(error_messages.user_not_found, 404);
		if (user.disabled_at) throw new ServerError(error_messages.user_disabled, 403);
		return { user };
	})
	.macro({
		auth: (options?: boolean | { verified?: boolean }) => ({
			resolve: async ({ user }) => {
				if (options === false) return;

				const should_verify =
					options === true ||
					options === undefined ||
					(typeof options === 'object' && options.verified !== false);

				if (should_verify && !user?.email_verified_at) {
					throw new ServerError(error_messages.email_not_verified, 403);
				}
				return { user };
			},
		}),

		role: (allowed_roles: UserRole[]) => ({
			resolve: async ({ user: authenticated_user }) => {
				const user_role = authenticated_user?.role as UserRole;
				if (!allowed_roles.includes(user_role)) throw new ServerError(error_messages.user_forbidden, 403);
				return { user: authenticated_user };
			}
		}),

		permission: (permission: typeof permissions[number]) => ({
			resolve: async ({ user: authenticated_user }) => {
				const user = authenticated_user!;
				if (user.role === "superuser" || user.role === "admin") {
					return { user };
				}

				const has_permission = await user_service.check_permissions(user.id, permission);
				if (!has_permission) throw new ServerError(error_messages.user_forbidden, 403);
				return { user };
			}
		})
	})