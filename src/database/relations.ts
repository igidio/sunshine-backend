import { defineRelations } from "drizzle-orm";
import * as schemas from "~/database/schema";

export const relations = defineRelations(schemas, (r) => ({
  profile_schema: {
    user: r.one.user_schema({
      from: r.profile_schema.id,
      to: r.user_schema.profile_id
    }),
    customer: r.one.customer_schema({
      from: r.profile_schema.id,
      to: r.customer_schema.profile_id
    })
  },
  user_schema: {
    profile: r.one.profile_schema({
      from: r.user_schema.profile_id,
      to: r.profile_schema.id
    }),
  },
  customer_schema: {
    profile: r.one.profile_schema({
      from: r.customer_schema.profile_id,
      to: r.profile_schema.id
    }),
  },

}))