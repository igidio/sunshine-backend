import { fakerES as faker } from "@faker-js/faker";
import type { appointment_insert } from "~/modules/appointment/appointment.schema";

const format_time = (date: Date) =>
  `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

export const appointment_factory = (): appointment_insert => {
  const date = faker.date.between({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  });

  const hour = faker.date.between({
    from: new Date(new Date().setHours(9, 0, 0, 0)),
    to: new Date(new Date().setHours(18, 0, 0, 0)),
  });

  return {
    customer_id: faker.number.int({ min: 1, max: 10 }),
    service_id: faker.number.int({ min: 1, max: 15 }),
    date: date,
    time: format_time(hour),
    notes: faker.lorem.paragraph(),
  } as appointment_insert;
};