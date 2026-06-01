import { fakerES as faker } from "@faker-js/faker";
import { appointment_hours } from "~/modules/appointment/appointment_hours";
import type { appointment_insert } from "~/modules/appointment/appointment.schema";

const format_time = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

const apply_time = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return result;
};

const is_weekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const max_appointment_duration = 120;

export const appointment_factory = (): appointment_insert => {
  const date = faker.date.between({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  });
  const formatted_date = date.toISOString().slice(0, 10);

  const hours = is_weekend(date) ? appointment_hours.weekend : appointment_hours.weekday;
  const latest_start = apply_time(date, hours.end);
  latest_start.setMinutes(latest_start.getMinutes() - max_appointment_duration);

  const hour = faker.date.between({
    from: apply_time(date, hours.start),
    to: latest_start,
  });
  const duration = faker.number.int({ min: 20, max: 120 });
  const time_start = format_time(hour);
  const time_end_date = new Date(hour);
  time_end_date.setMinutes(time_end_date.getMinutes() + duration);

  return {
    customer_id: faker.number.int({ min: 1, max: 10 }),
    treatment_id: faker.number.int({ min: 1, max: 15 }),
    date: formatted_date,
    time_start,
    time_end: format_time(time_end_date),
    notes: faker.lorem.paragraph(),
  };
};