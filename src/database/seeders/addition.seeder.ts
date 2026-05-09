import { addition_schema, type addition_insert } from "~/modules/addition/addition.schema";

const data: addition_insert[] = [
  {
    supplier_id: 1,
    product_id: 1,
    quantity: 50,
    created_at: new Date("2026-04-20T09:00:00Z"),
    updated_at: new Date("2026-04-20T09:00:00Z"),
  },
  {
    supplier_id: 1,
    product_id: 2,
    quantity: 40,
    created_at: new Date("2026-04-21T09:30:00Z"),
    updated_at: new Date("2026-04-21T09:30:00Z"),
  },
  {
    supplier_id: 2,
    product_id: 3,
    quantity: 30,
    created_at: new Date("2026-04-22T10:00:00Z"),
    updated_at: new Date("2026-04-22T10:00:00Z"),
  },
  {
    supplier_id: 2,
    product_id: 4,
    quantity: 25,
    created_at: new Date("2026-04-22T11:00:00Z"),
    updated_at: new Date("2026-04-22T11:00:00Z"),
  },
  {
    supplier_id: 2,
    product_id: 5,
    quantity: 20,
    created_at: new Date("2026-04-23T09:15:00Z"),
    updated_at: new Date("2026-04-23T09:15:00Z"),
  },
  {
    supplier_id: 3,
    product_id: 6,
    quantity: 45,
    created_at: new Date("2026-04-24T09:20:00Z"),
    updated_at: new Date("2026-04-24T09:20:00Z"),
  },
  {
    supplier_id: 3,
    product_id: 7,
    quantity: 35,
    created_at: new Date("2026-04-24T10:30:00Z"),
    updated_at: new Date("2026-04-24T10:30:00Z"),
  },
  {
    supplier_id: 1,
    product_id: 8,
    quantity: 30,
    created_at: new Date("2026-04-25T09:00:00Z"),
    updated_at: new Date("2026-04-25T09:00:00Z"),
  },
  {
    supplier_id: 1,
    product_id: 9,
    quantity: 20,
    created_at: new Date("2026-04-25T10:00:00Z"),
    updated_at: new Date("2026-04-25T10:00:00Z"),
  },
  {
    supplier_id: 3,
    product_id: 10,
    quantity: 25,
    created_at: new Date("2026-04-26T09:50:00Z"),
    updated_at: new Date("2026-04-26T09:50:00Z"),
  },
  {
    supplier_id: 3,
    product_id: 11,
    quantity: 40,
    created_at: new Date("2026-04-26T11:00:00Z"),
    updated_at: new Date("2026-04-26T11:00:00Z"),
  },
  {
    supplier_id: 2,
    product_id: 12,
    quantity: 35,
    created_at: new Date("2026-04-27T09:40:00Z"),
    updated_at: new Date("2026-04-27T09:40:00Z"),
  },
];

export default {
  data,
  type: addition_schema,
};
