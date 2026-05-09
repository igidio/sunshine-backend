import type { sale_treatment_detail_insert } from "~/modules/sale/sale.schema";
import { sale_treatment_detail_schema } from "../schema";

const data: sale_treatment_detail_insert[] = [
  {
    sale_id: 1,
    treatment_id: 1,
    staff_id: 3,
    price: 25.0,
  },
  {
    sale_id: 2,
    treatment_id: 6,
    staff_id: 4,
    price: 50.0,
  },
  {
    sale_id: 3,
    treatment_id: 9,
    staff_id: 3,
    price: 35.0,
  },
  {
    sale_id: 4,
    treatment_id: 7,
    staff_id: 4,
    price: 30.0,
  },
  {
    sale_id: 4,
    treatment_id: 8,
    staff_id: 4,
    price: 40.0,
  },
  {
    sale_id: 5,
    treatment_id: 3,
    staff_id: 5,
    price: 15.0,
  },
  {
    sale_id: 6,
    treatment_id: 10,
    staff_id: 3,
    price: 45.0,
  },
  {
    sale_id: 7,
    treatment_id: 14,
    staff_id: 5,
    price: 50.0,
  },
  {
    sale_id: 8,
    treatment_id: 15,
    staff_id: 4,
    price: 55.0,
  },
  {
    sale_id: 9,
    treatment_id: 12,
    staff_id: 3,
    price: 30.0,
  },
  {
    sale_id: 10,
    treatment_id: 16,
    staff_id: 4,
    price: 70.0,
  },
];

export default {
  data,
  type: sale_treatment_detail_schema,
};
