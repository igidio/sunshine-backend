import db from "~/database";
import { sale_schema, sale_product_detail_schema, sale_appointment_detail_schema } from "../sale/sale.schema";
import { product_schema } from "../product/product.schema";
import { category_schema } from "../category/category.schema";
import { customer_schema } from "../customer/customer.schema";
import { profile_schema } from "../profile/profile.schema";
import { treatment_schema } from "../treatment/treatment.schema";
import { appointment_schema } from "../appointment/appointment.schema";
import { stock_schema } from "../stock/stock.schema";
import { sql, eq, gte, lte, and, isNull, count, sum, desc, asc } from "drizzle-orm";

const start_of_today = () => {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
};

const start_of_week = () => {
	const d = new Date();
	const day = d.getDay();
	const diff = day === 0 ? 6 : day - 1;
	d.setDate(d.getDate() - diff);
	d.setHours(0, 0, 0, 0);
	return d;
};

const end_of_week = () => {
	const d = start_of_week();
	d.setDate(d.getDate() + 6);
	d.setHours(23, 59, 59, 999);
	return d;
};

const start_of_month = () => {
	const d = new Date();
	d.setDate(1);
	d.setHours(0, 0, 0, 0);
	return d;
};

export const dashboard_repository = {
	total_sales_today: async () => {
		const [result] = await db
			.select({ total: sql<number>`COALESCE(SUM(${sale_schema.total}), 0)` })
			.from(sale_schema)
			.where(gte(sale_schema.created_at, start_of_today()));
		return Number(result?.total ?? 0);
	},

	total_sales_week: async () => {
		const [result] = await db
			.select({ total: sql<number>`COALESCE(SUM(${sale_schema.total}), 0)` })
			.from(sale_schema)
			.where(and(
				gte(sale_schema.created_at, start_of_week()),
				lte(sale_schema.created_at, end_of_week()),
			));
		return Number(result?.total ?? 0);
	},

	total_sales_month: async () => {
		const [result] = await db
			.select({ total: sql<number>`COALESCE(SUM(${sale_schema.total}), 0)` })
			.from(sale_schema)
			.where(gte(sale_schema.created_at, start_of_month()));
		return Number(result?.total ?? 0);
	},

	sales_trend: async () => {
		const thirty_days_ago = new Date();
		thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);
		thirty_days_ago.setHours(0, 0, 0, 0);

		return await db
			.select({
				date: sql<string>`DATE(${sale_schema.created_at})`,
				total: sum(sale_schema.total),
				count: count(),
			})
			.from(sale_schema)
			.where(gte(sale_schema.created_at, thirty_days_ago))
			.groupBy(sql`DATE(${sale_schema.created_at})`)
			.orderBy(asc(sql`DATE(${sale_schema.created_at})`));
	},

	sales_by_payment_method: async () => {
		return await db
			.select({
				payment_method: sale_schema.payment_method,
				total: sum(sale_schema.total),
				count: count(),
			})
			.from(sale_schema)
			.groupBy(sale_schema.payment_method);
	},

	top_10_products: async () => {
		const total_quantity = sql<number>`COALESCE(SUM(${sale_product_detail_schema.quantity}), 0)`;
		const total_revenue = sql<number>`COALESCE(SUM(${sale_product_detail_schema.quantity} * ${sale_product_detail_schema.unit_price}), 0)`;

		return await db
			.select({
				product_id: product_schema.id,
				product_name: product_schema.name,
				total_quantity,
				total_revenue,
			})
			.from(sale_product_detail_schema)
			.innerJoin(product_schema, eq(sale_product_detail_schema.product_id, product_schema.id))
			.groupBy(product_schema.id, product_schema.name)
			.orderBy(desc(total_revenue))
			.limit(10);
	},

	top_10_treatments: async () => {
		const total_revenue = sql<number>`COALESCE(SUM(${sale_appointment_detail_schema.price}), 0)`;

		return await db
			.select({
				treatment_id: treatment_schema.id,
				treatment_name: treatment_schema.name,
				count: count(),
				total_revenue,
			})
			.from(sale_appointment_detail_schema)
			.innerJoin(appointment_schema, eq(sale_appointment_detail_schema.appointment_id, appointment_schema.id))
			.innerJoin(treatment_schema, eq(appointment_schema.treatment_id, treatment_schema.id))
			.groupBy(treatment_schema.id, treatment_schema.name)
			.orderBy(desc(total_revenue))
			.limit(10);
	},

	latest_sales: async () => {
		return await db
			.select({
				id: sale_schema.id,
				total: sale_schema.total,
				payment_method: sale_schema.payment_method,
				created_at: sale_schema.created_at,
				bill: sale_schema.bill,
				customer_id: customer_schema.id,
				first_name: profile_schema.first_name,
				last_name: profile_schema.last_name,
			})
			.from(sale_schema)
			.innerJoin(customer_schema, eq(sale_schema.customer_id, customer_schema.id))
			.innerJoin(profile_schema, eq(customer_schema.profile_id, profile_schema.id))
			.orderBy(desc(sale_schema.created_at))
			.limit(10);
	},

	generated_bills: async () => {
		const [today] = await db
			.select({ total: count() })
			.from(sale_schema)
			.where(and(
				gte(sale_schema.created_at, start_of_today()),
				sql`${sale_schema.bill} IS NOT NULL`,
			));

		const [week] = await db
			.select({ total: count() })
			.from(sale_schema)
			.where(and(
				gte(sale_schema.created_at, start_of_week()),
				lte(sale_schema.created_at, end_of_week()),
				sql`${sale_schema.bill} IS NOT NULL`,
			));

		const [month] = await db
			.select({ total: count() })
			.from(sale_schema)
			.where(and(
				gte(sale_schema.created_at, start_of_month()),
				sql`${sale_schema.bill} IS NOT NULL`,
			));

		return {
			today: today?.total ?? 0,
			week: week?.total ?? 0,
			month: month?.total ?? 0,
		};
	},

	week_appointments: async () => {
		return await db
			.select({
				id: appointment_schema.id,
				date: appointment_schema.date,
				time_start: appointment_schema.time_start,
				time_end: appointment_schema.time_end,
				customer_id: customer_schema.id,
				first_name: profile_schema.first_name,
				last_name: profile_schema.last_name,
				treatment_name: treatment_schema.name,
			})
			.from(appointment_schema)
			.innerJoin(customer_schema, eq(appointment_schema.customer_id, customer_schema.id))
			.innerJoin(profile_schema, eq(customer_schema.profile_id, profile_schema.id))
			.innerJoin(treatment_schema, eq(appointment_schema.treatment_id, treatment_schema.id))
			.where(and(
				gte(appointment_schema.date, sql`${start_of_week().toISOString().slice(0, 10)}`),
				lte(appointment_schema.date, sql`${end_of_week().toISOString().slice(0, 10)}`),
				isNull(appointment_schema.deleted_at),
			))
			.orderBy(asc(appointment_schema.date), asc(appointment_schema.time_start))
			.limit(5);
	},

	low_stock_products: async () => {
		return await db
			.select({
				stock_id: stock_schema.id,
				product_id: product_schema.id,
				product_name: product_schema.name,
				price: product_schema.price,
				quantity: stock_schema.quantity,
			})
			.from(stock_schema)
			.innerJoin(product_schema, eq(stock_schema.product_id, product_schema.id))
			.where(and(
				isNull(stock_schema.deleted_at),
				isNull(product_schema.deleted_at),
				isNull(product_schema.disabled_at),
			))
			.orderBy(asc(stock_schema.quantity))
			.limit(10);
	},

	total_inventory_value: async () => {
		const [result] = await db
			.select({
				total: sql<number>`COALESCE(SUM(${stock_schema.quantity} * ${product_schema.price}), 0)`,
			})
			.from(stock_schema)
			.innerJoin(product_schema, eq(stock_schema.product_id, product_schema.id))
			.where(and(
				isNull(stock_schema.deleted_at),
				isNull(product_schema.deleted_at),
			));
		return Number(result?.total ?? 0);
	},

	total_products_in_stock: async () => {
		const [result] = await db
			.select({ total: count() })
			.from(stock_schema)
			.where(isNull(stock_schema.deleted_at));
		return result?.total ?? 0;
	},

	total_customers: async () => {
		const [result] = await db
			.select({ total: count() })
			.from(customer_schema)
			.where(isNull(customer_schema.deleted_at));
		return result?.total ?? 0;
	},

	new_customers_this_month: async () => {
		const [result] = await db
			.select({ total: count() })
			.from(customer_schema)
			.where(and(
				gte(customer_schema.created_at, start_of_month()),
				isNull(customer_schema.deleted_at),
			));
		return result?.total ?? 0;
	},

	total_active_products: async () => {
		const [result] = await db
			.select({ total: count() })
			.from(product_schema)
			.where(and(
				isNull(product_schema.deleted_at),
				isNull(product_schema.disabled_at),
			));
		return result?.total ?? 0;
	},

	products_by_category: async () => {
		return await db
			.select({
				category_id: category_schema.id,
				category_name: category_schema.name,
				total: count(product_schema.id),
			})
			.from(category_schema)
			.leftJoin(product_schema, and(
				eq(product_schema.category_id, category_schema.id),
				isNull(product_schema.deleted_at),
			))
			.where(isNull(category_schema.deleted_at))
			.groupBy(category_schema.id, category_schema.name)
			.orderBy(desc(count(product_schema.id)));
	},

	average_price_by_category: async () => {
		const average_price = sql<number>`COALESCE(AVG(${product_schema.price}), 0)`;

		return await db
			.select({
				category_id: category_schema.id,
				category_name: category_schema.name,
				average_price,
			})
			.from(category_schema)
			.innerJoin(product_schema, eq(product_schema.category_id, category_schema.id))
			.where(and(
				isNull(category_schema.deleted_at),
				isNull(product_schema.deleted_at),
			))
			.groupBy(category_schema.id, category_schema.name)
			.orderBy(desc(average_price));
	},

	most_popular_categories: async () => {
		return await db
			.select({
				category_id: category_schema.id,
				category_name: category_schema.name,
				product_count: count(product_schema.id),
			})
			.from(category_schema)
			.innerJoin(product_schema, eq(product_schema.category_id, category_schema.id))
			.where(and(
				isNull(category_schema.deleted_at),
				isNull(product_schema.deleted_at),
			))
			.groupBy(category_schema.id, category_schema.name)
			.orderBy(desc(count(product_schema.id)));
	},
};
