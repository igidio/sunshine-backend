import Elysia from "elysia";
import { wishlist_service } from "./wishlist.service";
import { plugin_auth } from "~/plugins/auth";
import { CreateWishlistDtoSchema, ReadWishlistDtoSchema } from "./wishlist.dto";
import { IdSchema } from "~/helpers/types";

export const wishlist_routes = new Elysia({
	prefix: "/wishlist"
})
	.use(plugin_auth)

	.get("/", async ({ query, user }) => {
		return await wishlist_service.find_all(query, user);
	}, {
		auth: true,
		query: ReadWishlistDtoSchema
	})

	.get("/:id", async ({ params, user }) => {
		return await wishlist_service.find_one(params.id, user);
	}, {
		auth: true,
		params: IdSchema
	})

	.post("/", async ({ body, user }) => {
		return await wishlist_service.create(body, user);
	}, {
		auth: true,
		role: ["customer"],
		body: CreateWishlistDtoSchema
	})

	.delete("/", async ({ user }) => {
		return await wishlist_service.delete_all(user);
	}, {
		auth: true,
		role: ["customer"],
	})

	.delete("/:id", async ({ params, user }) => {
		return await wishlist_service.delete_one(params.id, user);
	}, {
		auth: true,
		role: ["customer"],
		params: IdSchema
	});

export default wishlist_routes;
