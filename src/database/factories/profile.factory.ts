import { fakerES as faker } from '@faker-js/faker';
import type { profile_insert } from '~/modules/profile/profile.schema';

export const create_faker_profile = (): profile_insert => {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    birth_date: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
    address: faker.location.streetAddress({ useFullAddress: true }),
  };
};