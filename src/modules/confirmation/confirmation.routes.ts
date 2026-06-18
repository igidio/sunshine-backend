import Elysia from "elysia";
import { plugin_auth } from "~/plugins/auth";
import { confirmation_service } from "./confirmation.service";
import { CreateEmailConfirmationDtoSchema, GenericTokenDtoSchema, InvitationResponseDtoSchema, PasswordConfirmDtoSchema } from "./confirmation.dto";
import { error_messages } from "~/data/error_messages";

const public_routes = new Elysia()

	.post("/password",
		({ body: { email } }) => confirmation_service.send_password_recovery(email),
		{ body: CreateEmailConfirmationDtoSchema },
	)

	.get("/password/:token",
		({ params: { token } }) => confirmation_service.check_password_recovery(token),
	)

	.post("/password/:token",
		({ body: { password }, params: { token } }) =>
			confirmation_service.confirm_password_recovery(token, password),
		{ body: PasswordConfirmDtoSchema, params: GenericTokenDtoSchema },
	)

	.patch("/email/:token",
		({ params: { token } }) => confirmation_service.check_verification(token),
	)

	.get("/:token",
		({ params: { token } }) => confirmation_service.check_generic(token),
	)

const auth_routes = new Elysia()
	.use(plugin_auth)

	.post("/email",
		({ user }) => confirmation_service.send_verification_email(user),
		{ auth: { verified: false } },
	)

	.post("/invite",
		({ body, user }) => {
			if (user.role === 'admin' && body.role === 'admin') {
				throw new Error(error_messages.confirmation_admin_invite_not_allowed);
			}
			return confirmation_service.send_invitation(body)
		},
		{ auth: true, role: ["superuser", "admin"], body: InvitationResponseDtoSchema },
	)

	.get("/invitations",
		() => confirmation_service.get_invitations(),
		{ auth: true, role: ["superuser", "admin"] },
	)

	.post("/invitations",
		({ user, body }) => confirmation_service.invalidate_invitation(body.token, user.id),
		{ auth: true, role: ["superuser"], body: GenericTokenDtoSchema },
	);

export const confirmation_routes = new Elysia({ prefix: "/confirmation" })
	.use(public_routes)
	.use(auth_routes);

export default confirmation_routes;
