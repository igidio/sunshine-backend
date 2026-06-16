import { defineRelations } from "drizzle-orm";
import * as schemas from "~/database/schema";
import { sale_appointment_detail_schema } from "~/database/schema";

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
    confirmations_invalidated: r.many.confirmation_schema({
      from: r.user_schema.id,
      to: r.confirmation_schema.invalidated_by,
    }),
  },
  customer_schema: {
    profile: r.one.profile_schema({
      from: r.customer_schema.profile_id,
      to: r.profile_schema.id
    }),
    appointments: r.many.appointment_schema(),
    wishlist: r.many.wishlist_schema(),

  },
  sale_schema: {
    products: r.many.product_schema({
      from: r.sale_schema.id.through(r.sale_product_detail_schema.sale_id),
      to: r.product_schema.id.through(r.sale_product_detail_schema.product_id),
    }),
    appointments: r.many.appointment_schema({
      from: r.sale_schema.id.through(r.sale_appointment_detail_schema.sale_id),
      to: r.appointment_schema.id.through(r.sale_appointment_detail_schema.appointment_id),
    }),

    product_details: r.many.sale_product_detail_schema(),
    appointment_details: r.many.sale_appointment_detail_schema(),

    customer: r.one.customer_schema({
      from: r.sale_schema.customer_id,
      to: r.customer_schema.id,
    }),
  },
  product_schema: {
    sales: r.many.sale_schema({
      from: r.product_schema.id.through(r.sale_product_detail_schema.product_id),
      to: r.sale_schema.id.through(r.sale_product_detail_schema.sale_id),
    }),
    sale_details: r.many.sale_product_detail_schema(),
    category: r.one.category_schema({
      from: r.product_schema.category_id,
      to: r.category_schema.id,
    }),
    stock: r.one.stock_schema({
      from: r.product_schema.id,
      to: r.stock_schema.product_id,
    }),
    movement_schema: r.many.movement_schema(),
    suppliers: r.many.supplier_schema({
      from: r.product_schema.id.through(r.movement_schema.stock_id),
      to: r.supplier_schema.id.through(r.movement_schema.supplier_id),
    }),
    images: r.many.product_image_schema(),
  },

  product_image_schema: {
    product: r.one.product_schema({
      from: r.product_image_schema.product_id,
      to: r.product_schema.id,
    }),
  },
  treatment_schema: {
    appointments: r.many.appointment_schema(),
  },
  sale_product_detail_schema: {
    sale: r.one.sale_schema({
      from: r.sale_product_detail_schema.sale_id,
      to: r.sale_schema.id,
    }),
    product: r.one.product_schema({
      from: r.sale_product_detail_schema.product_id,
      to: r.product_schema.id,
    }),
  },
  sale_appointment_detail_schema: {
    sale: r.one.sale_schema({
      from: r.sale_appointment_detail_schema.sale_id,
      to: r.sale_schema.id,
    }),
    appointment: r.one.appointment_schema({
      from: r.sale_appointment_detail_schema.appointment_id,
      to: r.appointment_schema.id,
    }),
  },
  category_schema: {
    products: r.many.product_schema(),
  },
  stock_schema: {
    product: r.one.product_schema({
      from: r.stock_schema.product_id,
      to: r.product_schema.id,
    }),
  },
  supplier_schema: {
    movements: r.many.movement_schema(),
    products_by_stock: r.many.product_schema({
      from: r.supplier_schema.id.through(r.movement_schema.supplier_id),
      to: r.product_schema.id.through(r.movement_schema.stock_id),
    }),
  },
  movement_schema: {
    supplier: r.one.supplier_schema({
      from: r.movement_schema.supplier_id,
      to: r.supplier_schema.id,
    }),

    product: r.one.product_schema({
      from: r.movement_schema.stock_id,
      to: r.product_schema.id,
    }),
  },
  appointment_schema: {
    customer: r.one.customer_schema({
      from: r.appointment_schema.customer_id,
      to: r.customer_schema.id,
    }),
    treatment: r.one.treatment_schema({
      from: r.appointment_schema.treatment_id,
      to: r.treatment_schema.id,
    }),
    sale_appointment_detail: r.one.sale_appointment_detail_schema({
      from: r.appointment_schema.id,
      to: r.sale_appointment_detail_schema.appointment_id,
    }),
  },
  notification_schema: {
    user: r.one.user_schema({
      from: r.notification_schema.user_id,
      to: r.user_schema.id,
    }),
  },
  wishlist_schema: {
    product: r.one.product_schema({
      from: r.wishlist_schema.product_id,
      to: r.product_schema.id,
    }),
    customer: r.one.customer_schema({
      from: r.wishlist_schema.customer_id,
      to: r.customer_schema.id,
    }),
  },
  confirmation_schema: {
    invalidated_by_user: r.one.user_schema({
      from: r.confirmation_schema.invalidated_by,
      to: r.user_schema.id,
    }),
  }
}))