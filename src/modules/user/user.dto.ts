import z from "zod";
import { PaginationTypeSchema, StatusSchemaDto, type PaginationType, type StatusDto } from "~/helpers/types";
import { user_roles, type UserRole } from "./user.schema";
import { permissions } from "~/data/permissions";

const password = z.string().min(8);

export const CreateUserDtoSchema = z.object({
	username: z.string().min(4).max(32),
	password,
	email: z.email().max(255),
	phone_number: z.string().max(20).optional(),
});
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export const UserLoginDtoSchema = z.object({
	username_or_email: z.string().min(1),
	password,
	remember_me: z.boolean().optional()
});
export type UserLoginDto = z.infer<typeof UserLoginDtoSchema>;

export const ReadUserDtoSchema = PaginationTypeSchema.extend({
	role: z.enum(user_roles).optional(),
	status: StatusSchemaDto.shape.status.optional(),
});
export type ReadUserDto = z.infer<typeof ReadUserDtoSchema>;


export const UpdateUserDtoSchema = CreateUserDtoSchema.partial().extend({
	//role: z.enum(user_roles).optional(),
}).omit({ password: true });
export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;

export const UpdateUserPasswordDtoSchema = z.object({
	current_password: password,
	new_password: password,
});
export type UpdateUserPasswordDto = z.infer<typeof UpdateUserPasswordDtoSchema>;

export const ToggleDisabledUserDtoSchema = z.object({
	disabled: z.boolean().optional(),
});
export type ToggleDisabledUserDto = z.infer<typeof ToggleDisabledUserDtoSchema>;

export const SetPermissionsUserDtoSchema = z.object({
	permissions: z.array(z.enum(permissions as unknown as [string, ...string[]])),
});
export type SetPermissionsUserDto = z.infer<typeof SetPermissionsUserDtoSchema>;

