import type { sale_insert } from "~/modules/sale/sale.schema";
import { sale_schema } from "../schema";

const data: sale_insert[] = [
  {
    customer_id: 1,
    total: 44.99,
    payment_method: "cash",
    created_at: new Date("2026-05-01T10:15:00Z"),
  },
  {
    customer_id: 2,
    total: 62.98,
    payment_method: "card",
    created_at: new Date("2026-05-02T13:30:00Z"),
  },
  {
    customer_id: 3,
    total: 40.99,
    payment_method: "transfer",
    created_at: new Date("2026-05-03T09:45:00Z"),
  },
  {
    customer_id: 4,
    total: 70.0,
    payment_method: "cash",
    created_at: new Date("2026-05-03T16:00:00Z"),
  },
  {
    customer_id: 5,
    total: 33.98,
    payment_method: "card",
    created_at: new Date("2026-05-04T11:20:00Z"),
  },
  {
    customer_id: 6,
    total: 48.99,
    payment_method: "cash",
    created_at: new Date("2026-05-05T15:10:00Z"),
  },
  {
    customer_id: 7,
    total: 83.98,
    payment_method: "card",
    created_at: new Date("2026-05-06T14:25:00Z"),
  },
  {
    customer_id: 8,
    total: 62.99,
    payment_method: "transfer",
    created_at: new Date("2026-05-07T12:05:00Z"),
  },
  {
    customer_id: 9,
    total: 42.99,
    payment_method: "cash",
    created_at: new Date("2026-05-08T10:50:00Z"),
  },
  {
    customer_id: 10,
    total: 104.98,
    payment_method: "card",
    created_at: new Date("2026-05-08T17:40:00Z"),
  },
];

export default {
  data,
  type: sale_schema,
};
