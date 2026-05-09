import { defineRelations } from "drizzle-orm";
import { customer_schema } from "~/api/customer/customer.schema";
import { product_schema } from "~/api/product/product.schema"
import { profile_schema } from "~/api/profile/profile.schema";
import { user_schema } from "~/api/user/user.schema";



export {
  user_schema,
  profile_schema,
  product_schema,
  customer_schema
}

export const relations = defineRelations({
  user_schema, profile_schema, product_schema, customer_schema
}, (r) => ({
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