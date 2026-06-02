import { sale_appointment_detail_schema, type sale_appointment_detail_insert } from "~/modules/sale/sale.schema";

const data: sale_appointment_detail_insert[] = [
  { sale_id: 1, appointment_id: 1, price: 25.0 },
  { sale_id: 2, appointment_id: 2, price: 50.0 },
  { sale_id: 3, appointment_id: 3, price: 35.0 },
  { sale_id: 4, appointment_id: 4, price: 30.0 },
  { sale_id: 4, appointment_id: 8, price: 40.0 },
  { sale_id: 5, appointment_id: 5, price: 15.0 },
  { sale_id: 6, appointment_id: 10, price: 45.0 },
  { sale_id: 7, appointment_id: 14, price: 50.0 },
  { sale_id: 8, appointment_id: 15, price: 55.0 },
  { sale_id: 9, appointment_id: 12, price: 30.0 },
  { sale_id: 10, appointment_id: 16, price: 70.0 },
];

export default {
  data,
  type: sale_appointment_detail_schema,
};
