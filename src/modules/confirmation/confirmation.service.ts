import { confirmation_repository } from "./confirmation.repository";
import type { ConfirmationType } from "./confirmation.schema";
import { Cryptor } from "~/helpers/cryptor";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import { DateTime } from "luxon";
import { user_service } from "../user/user.service";
import { transporter } from "../transporter/transporter";
import type { user_select } from "../user/user.schema";
import type { CreateEmailConfirmationDto, InvitationResponseDto } from "./confirmation.dto";

export const confirmation_service = {

	create: async ({
		data,
		type,
		description,
	}: {
		data: Record<string, unknown>;
		type: ConfirmationType;
		description?: string;
	}) => {
		const expiration_days = type === "add_admin" ? 7 : 1;

		const encrypted_data = Cryptor.encrypt({
			message: JSON.stringify(data),
			is_alphanumeric: true,
		});

		await confirmation_repository.create({
			token: encrypted_data,
			type,
			expiration_days,
			description,
		});

		const confirmation = await confirmation_repository.find_one(encrypted_data);

		return {
			confirmation,
			token: encrypted_data,
		}
	},

	decrypt: (encrypted_data: string, as_json: boolean = false) => {
		try {
			const result = Cryptor.decrypt({
				encrypted_message: encrypted_data,
				is_alphanumeric: true,
			});

			if (!result) {
				throw new ServerError(error_messages.confirmation_invalid_key, 400);
			}

			return as_json ? JSON.parse(result) : result;
		} catch {
			throw new ServerError(error_messages.confirmation_invalid_key, 400);
		}
	},

	find_one: async (token: string) => {
		return confirmation_repository.find_one(token);
	},

	find: async (options: { type?: ConfirmationType; description?: string }) => {
		return confirmation_repository.find(options);
	},

	find_by_description: async (description: string) => {
		return confirmation_repository.find_by_description(description);
	},

	check: async (token: string) => {
		const confirmation = await confirmation_repository.find_one(token);

		if (!confirmation) {
			throw new ServerError(error_messages.confirmation_not_found, 404);
		}

		if (!confirmation.is_valid) {
			throw new ServerError(error_messages.confirmation_invalidated, 406);
		}

		if (confirmation.has_used) {
			throw new ServerError(error_messages.confirmation_already_used, 406);
		}

		const date_valid = confirmation_service.is_date_valid(
			confirmation.created_at!,
			confirmation.expiration_days,
			"days",
		);

		if (!date_valid) {
			throw new ServerError(error_messages.confirmation_expired, 406);
		}

		return confirmation;
	},

	is_date_valid: (date: Date, amount: number, type: "hours" | "days" | "weeks" | "months") => {
		const startDate = DateTime.fromJSDate(date);
		const endDate = startDate.plus({ [type]: amount });
		const today = DateTime.now();
		return today >= startDate && today <= endDate;
	},

	send_to_client: (data: unknown) => {
		return Cryptor.encrypt({
			message: JSON.stringify(data),
			is_alphanumeric: true,
			use_client_key: true,
		});
	},

	mark_as_used: async (id: number) => {
		return confirmation_repository.mark_as_used(id);
	},

	invalidate: async (id: number, invalidated_by: number) => {
		return confirmation_repository.invalidate(id, invalidated_by);
	},

	compare_with_seconds: (date: Date, seconds: number) => {
		const targetTimestamp = date.getTime() + seconds * 1000;
		return Date.now() < targetTimestamp;
	},

	_assert_type: (confirmation: { type: string }, expected: ConfirmationType) => {
		if (confirmation.type !== expected) {
			throw new ServerError(error_messages.confirmation_invalid_type, 406);
		}
	},

	_get_email_from_token: (token: string) => {
		return confirmation_service.decrypt(token, true) as { email: string };
	},

	_get_user_by_token: async (token: string) => {
		const { email } = confirmation_service._get_email_from_token(token);
		const user = await user_service.find_by_email(email);
		if (!user) {
			throw new ServerError(error_messages.confirmation_email_not_found, 404);
		}
		return user;
	},

	send_verification_email: async (user: user_select) => {
		if (user.email_verified_at) {
			throw new ServerError(error_messages.confirmation_already_verified, 406);
		}

		const confirmations = await confirmation_service.find_by_description(user.email);
		// if (confirmations.length > 0) {
		// 	const is_too_soon = confirmation_service.compare_with_seconds(
		// 		confirmations[0]!.created_at!,
		// 		600,
		// 	);
		// 	if (is_too_soon) {
		// 		throw new ServerError(error_messages.confirmation_too_soon, 406);
		// 	}
		// }

		const response = await confirmation_service.create({
			data: { email: user.email },
			type: "verification",
			description: user.email,
		});


		return {
			token: response.token,
			//confirmation: confirmation.confirmation
		}
		

		// await transporter.emit_to_mail_microservice({
		// 	type: "verification",
		// 	data: {
		// 		url: `/confirmation/${confirmation!.token}`,
		// 		to: user.email,
		// 	},
		// });

		// return { message: "Correo de verificación enviado correctamente." };
	},

	check_verification: async (token: string) => {
		const confirmation = await confirmation_service.check(token);
		confirmation_service._assert_type(confirmation, "verification");

		const user = await confirmation_service._get_user_by_token(token);

		await user_service.verify_email(user.id);
		await confirmation_service.mark_as_used(confirmation.id);

		return { message: "Correo verificado exitosamente." };
	},

	send_password_recovery: async (email: string) => {
		const user = await user_service.find_by_email(email);
		if (!user) {
			throw new ServerError(error_messages.confirmation_email_not_found, 404);
		}

		const response = await confirmation_service.create({
			data: { email },
			type: "recovery",
		});

		return {
			token: response.token,
			//confirmation: confirmation.confirmation
		}

		// await transporter.emit_to_mail_microservice({
		// 	type: "recovery",
		// 	data: {
		// 		url: `/reset_password?token=${confirmation!.token}`,
		// 		to: email,
		// 	},
		// });

		return { message: "Correo de recuperación enviado correctamente." };
	},

	check_password_recovery: async (token: string) => {
		const confirmation = await confirmation_service.check(token);
		confirmation_service._assert_type(confirmation, "recovery");

		const user = await confirmation_service._get_user_by_token(token);

		return { email: user.email, username: user.username };
	},

	confirm_password_recovery: async (confirmation_key: string, password: string) => {
		const confirmation = await confirmation_service.check(confirmation_key);
		confirmation_service._assert_type(confirmation, "recovery");

		const user = await confirmation_service._get_user_by_token(confirmation_key);

		if (user.disabled_at) {
			throw new ServerError(error_messages.confirmation_account_inactive, 406);
		}

		await user_service.reset_password(user.id, password);
		await confirmation_service.mark_as_used(confirmation.id);

		return { message: "La contraseña fue actualizada correctamente." };
	},

	send_invitation: async (body: InvitationResponseDto) => {
		const response = await confirmation_service.create({
			data: { email: body.email, role: body.role },
			type: "add_admin",
			description: body.email,
		});

		return {
			token: response.token,
		}


		// await transporter.emit_to_mail_microservice({
		// 	type: "add_admin",
		// 	data: {
		// 		url: `/signup/${confirmation!.token}`,
		// 		to: body.email,
		// 	},
		// });

		return { message: "Invitación enviada correctamente." };
	},

	get_invitations: async () => {
		return confirmation_service.find({ type: "add_admin" });
	},

	invalidate_invitation: async (token: string, user_id: number) => {
		const confirmation = await confirmation_service.check(token);
		return confirmation_service.invalidate(confirmation.id, user_id);
	},

	check_generic: async (token: string) => {
		const confirmation = await confirmation_service.check(token);
		const { email } = confirmation_service._get_email_from_token(token);

		if (confirmation.type === "verification") {
			const user = await user_service.find_by_email(email);
			if (!user) {
				throw new ServerError(error_messages.confirmation_email_not_found, 404);
			}
			if (user.email_verified_at) {
				throw new ServerError(error_messages.confirmation_already_verified, 406);
			}

			await user_service.verify_email(user.id);
			await confirmation_service.mark_as_used(confirmation.id);

			return { message: "Cuenta verificada exitosamente." };
		}

		if (confirmation.type === "recovery") {
			const user = await user_service.find_by_email(email);
			if (!user) {
				throw new ServerError(error_messages.confirmation_email_not_found, 404);
			}
			return { email: user.email, username: user.username };
		}

		if (confirmation.type === "add_admin") {
			return { email, role: "admin", id: confirmation.id };
		}

		throw new ServerError(error_messages.confirmation_unsupported_type, 400);
	},
};
