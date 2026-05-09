import { stock_schema, type stock_insert } from "~/modules/stock/stock.schema";

const data: stock_insert[] = [
  { product_id: 1, quantity: 80, created_at: new Date(), updated_at: new Date() },
  { product_id: 2, quantity: 70, created_at: new Date(), updated_at: new Date() },
  { product_id: 3, quantity: 60, created_at: new Date(), updated_at: new Date() },
  { product_id: 4, quantity: 50, created_at: new Date(), updated_at: new Date() },
  { product_id: 5, quantity: 40, created_at: new Date(), updated_at: new Date() },
  { product_id: 6, quantity: 55, created_at: new Date(), updated_at: new Date() },
  { product_id: 7, quantity: 45, created_at: new Date(), updated_at: new Date() },
  { product_id: 8, quantity: 35, created_at: new Date(), updated_at: new Date() },
  { product_id: 9, quantity: 30, created_at: new Date(), updated_at: new Date() },
  { product_id: 10, quantity: 25, created_at: new Date(), updated_at: new Date() },
  { product_id: 11, quantity: 42, created_at: new Date(), updated_at: new Date() },
  { product_id: 12, quantity: 36, created_at: new Date(), updated_at: new Date() },
  { product_id: 13, quantity: 30, created_at: new Date(), updated_at: new Date() },
  { product_id: 14, quantity: 28, created_at: new Date(), updated_at: new Date() },
  { product_id: 15, quantity: 34, created_at: new Date(), updated_at: new Date() },
  { product_id: 16, quantity: 38, created_at: new Date(), updated_at: new Date() },
  { product_id: 17, quantity: 40, created_at: new Date(), updated_at: new Date() },
  { product_id: 18, quantity: 32, created_at: new Date(), updated_at: new Date() },
  { product_id: 19, quantity: 26, created_at: new Date(), updated_at: new Date() },
  { product_id: 20, quantity: 22, created_at: new Date(), updated_at: new Date() },
];

export default {
  data,
  type: stock_schema,
};
