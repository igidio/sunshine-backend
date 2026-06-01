import { appointment_schema, type appointment_insert } from "~/modules/appointment/appointment.schema";
import { appointment_factory } from "../factories/appointment.factory";

const data: appointment_insert[] = Array.from({ length: 20 }, () => appointment_factory());

export default {
	data,
	type: appointment_schema,

}