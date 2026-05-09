import type { sale_product_detail_insert } from "~/modules/sale/sale.schema";
import { sale_product_detail_schema } from "../schema";

const data: sale_product_detail_insert[] = [
  {
    sale_id: 1,
    product_id: 1,
    quantity: 1,
    unit_price: 19.99,
  },
  {
    sale_id: 2,
    product_id: 4,
    quantity: 1,
    unit_price: 7.99,
  },
  {
    sale_id: 2,
    product_id: 7,
    quantity: 1,
    unit_price: 4.99,
  },
  {
    sale_id: 3,
    product_id: 12,
    quantity: 1,
    unit_price: 5.99,
  },
  {
    sale_id: 5,
    product_id: 2,
    quantity: 1,
    unit_price: 9.99,
  },
  {
    sale_id: 5,
    product_id: 3,
    quantity: 1,
    unit_price: 8.99,
  },
  {
    sale_id: 6,
    product_id: 11,
    quantity: 1,
    unit_price: 3.99,
  },
  {
    sale_id: 7,
    product_id: 20,
    quantity: 1,
    unit_price: 8.99,
  },
  {
    sale_id: 7,
    product_id: 13,
    quantity: 1,
    unit_price: 24.99,
  },
  {
    sale_id: 8,
    product_id: 18,
    quantity: 1,
    unit_price: 7.99,
  },
  {
    sale_id: 9,
    product_id: 5,
    quantity: 1,
    unit_price: 12.99,
  },
  {
    sale_id: 10,
    product_id: 9,
    quantity: 1,
    unit_price: 14.99,
  },
  {
    sale_id: 10,
    product_id: 1,
    quantity: 1,
    unit_price: 19.99,
  },
];

export default {
  data,
  type: sale_product_detail_schema,
};
