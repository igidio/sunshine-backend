import db from "~/database";
import type { ModelWhere } from "~/helpers/types";
import { confirmation_schema, type ConfirmationType } from "./confirmation.schema";
import { eq } from "drizzle-orm";

type ConfirmationWhereConfig = ModelWhere<"confirmation_schema">;

const build_where_query = (options: {
	type?: ConfirmationType;
	description?: string;
}): ConfirmationWhereConfig => {
	const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

	return {
		...(options.type && { type: { eq: options.type } }),
		...(options.description && { description: { eq: options.description } }),
		OR: [
			{ created_at: { gte: twentyFourHoursAgo } },
			{ is_valid: { eq: true }, has_used: { eq: false } },
		],
	};
};

export const confirmation_repository = {
	create: async (data: {
		token: string;
		type: ConfirmationType;
		expiration_days: number;
		description?: string;
	}) => {
		return await db.insert(confirmation_schema).values(data);
	},

	find_one: async (token: string) => {
		return await db.query.confirmation_schema.findFirst({
			where: {
				token: { eq: token },
			},
		});
	},

	find: async (options: {
		type?: ConfirmationType;
		description?: string;
	}) => {
		return await db.query.confirmation_schema.findMany({
			where: build_where_query(options),
			orderBy: {
				created_at: "desc",
			},
		});
	},

	find_by_description: async (description: string) => {
		return await db.query.confirmation_schema.findMany({
			where: {
				description: { eq: description },
			},
			orderBy: {
				created_at: "desc",
			},
		});
	},

	mark_as_used: async (id: number) => {
		return await db
			.update(confirmation_schema)
			.set({ has_used: true })
			.where(eq(confirmation_schema.id, id));
	},

	invalidate: async (id: number, invalidated_by: number) => {
		return await db
			.update(confirmation_schema)
			.set({ is_valid: false, invalidated_by })
			.where(eq(confirmation_schema.id, id));
	},
};