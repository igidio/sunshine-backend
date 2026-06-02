import type { InferInsertModel } from "drizzle-orm";
import { wishlist_schema } from "~/modules/wishlist/wishlist.schema";

type WishlistItem = InferInsertModel<typeof wishlist_schema>;

const data: WishlistItem[] = [
  // Customer 1
  { customer_id: 1, product_id: 1, added_at: new Date() },
  { customer_id: 1, product_id: 5, added_at: new Date() },
  { customer_id: 1, product_id: 10, added_at: new Date() },
  // Customer 2
  { customer_id: 2, product_id: 3, added_at: new Date() },
  { customer_id: 2, product_id: 7, added_at: new Date() },
  // Customer 3
  { customer_id: 3, product_id: 2, added_at: new Date() },
  { customer_id: 3, product_id: 8, added_at: new Date() },
  { customer_id: 3, product_id: 12, added_at: new Date() },
  { customer_id: 3, product_id: 15, added_at: new Date() },
  // Customer 4
  { customer_id: 4, product_id: 6, added_at: new Date() },
  { customer_id: 4, product_id: 14, added_at: new Date() },
  // Customer 5
  { customer_id: 5, product_id: 4, added_at: new Date() },
  { customer_id: 5, product_id: 9, added_at: new Date() },
  { customer_id: 5, product_id: 18, added_at: new Date() },
  // Customer 6
  { customer_id: 6, product_id: 11, added_at: new Date() },
  { customer_id: 6, product_id: 16, added_at: new Date() },
  // Customer 7
  { customer_id: 7, product_id: 13, added_at: new Date() },
  { customer_id: 7, product_id: 17, added_at: new Date() },
  { customer_id: 7, product_id: 20, added_at: new Date() },
  // Customer 8
  { customer_id: 8, product_id: 19, added_at: new Date() },
  // Customer 9
  { customer_id: 9, product_id: 1, added_at: new Date() },
  { customer_id: 9, product_id: 6, added_at: new Date() },
  { customer_id: 9, product_id: 10, added_at: new Date() },
  // Customer 10
  { customer_id: 10, product_id: 5, added_at: new Date() },
  { customer_id: 10, product_id: 8, added_at: new Date() },
  { customer_id: 10, product_id: 12, added_at: new Date() },
];

export default {
  data,
  type: wishlist_schema,
};
