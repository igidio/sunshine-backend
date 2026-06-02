import type { CreateWishlistDto, ReadWishlistDto } from "./wishlist.dto";
import { wishlist_repository } from "./wishlist.repository";
import { ServerError } from "~/classes/server_error";
import { error_messages } from "~/data/error_messages";
import db from "~/database";

export const wishlist_service = {

	get_customer_id_by_user: async (user: { profile_id: number }) => {
		const customer = await db.query.customer_schema.findFirst({
			where: {
				profile_id: { eq: user.profile_id }
			}
		});
		return customer?.id;
	},

	find_all: async (query: ReadWishlistDto, user: { profile_id: number }) => {
		const customer_id = await wishlist_service.get_customer_id_by_user(user);
		if (!customer_id) {
			return { count: 0, data: [], limit: query.limit, offset: query.offset, is_last_page: true };
		}

		const count = await wishlist_repository.count(query, customer_id);
		const data = await wishlist_repository.find_all(query, customer_id);

		return {
			count,
			data,
			limit: query.limit,
			offset: query.offset,
			is_last_page: query.offset + query.limit >= count
		};
	},

	find_one: async (id: number, user: { profile_id: number }) => {
		const customer_id = await wishlist_service.get_customer_id_by_user(user);
		if (!customer_id) throw new ServerError(error_messages.wishlist_item_not_found, 404);

		const item = await wishlist_repository.find_one(id, customer_id);
		if (!item) throw new ServerError(error_messages.wishlist_item_not_found, 404);
		return item;
	},

	create: async (data: CreateWishlistDto, user: { profile_id: number }) => {
		const customer_id = await wishlist_service.get_customer_id_by_user(user);
		if (!customer_id) throw new ServerError(error_messages.customer_not_found, 404);

		const result = await wishlist_repository.create({
			product_id: data.product_id,
			customer_id,
		});

		return await wishlist_repository.find_one(result.id, customer_id);
	},

	delete_all: async (user: { profile_id: number }) => {
		const customer_id = await wishlist_service.get_customer_id_by_user(user);
		if (!customer_id) throw new ServerError(error_messages.customer_not_found, 404);

		return await wishlist_repository.delete_all(customer_id);
	},

	delete_one: async (id: number, user: { profile_id: number }) => {
		const customer_id = await wishlist_service.get_customer_id_by_user(user);
		if (!customer_id) throw new ServerError(error_messages.customer_not_found, 404);

		const result = await wishlist_repository.delete_one(id, customer_id);
		if (result.affectedRows === 0) throw new ServerError(error_messages.wishlist_item_not_found, 404);
		return result;
	}
};
