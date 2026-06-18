import z from "zod";

export const CreateEmailConfirmationDtoSchema = z.object({
	email: z.email().describe("Correo electrónico"),
});
export type CreateEmailConfirmationDto = z.infer<typeof CreateEmailConfirmationDtoSchema>;

export const PasswordConfirmDtoSchema = z.object({
	password: z.string().min(8).describe("Nueva contraseña"),
});
export type PasswordConfirmDto = z.infer<typeof PasswordConfirmDtoSchema>;

export const GenericTokenDtoSchema = z.object({
	token: z.string().describe("Token de confirmación"),
});
export type GenericTokenDto = z.infer<typeof GenericTokenDtoSchema>;

export const InvitationResponseDtoSchema = z.object({
	role: z.enum(["employer", "admin"]).optional().describe("Rol del usuario (opcional)"),
}).extend(CreateEmailConfirmationDtoSchema.shape)
export type InvitationResponseDto = z.infer<typeof InvitationResponseDtoSchema>;


