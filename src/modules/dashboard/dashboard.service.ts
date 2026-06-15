import { dashboard_repository } from "./dashboard.repository";

export const dashboard_service = {
	get: async () => {
		const [
			total_sales_today,
			total_sales_week,
			total_sales_month,
			sales_trend,
			sales_by_payment_method,
			top_10_products,
			top_10_treatments,
			latest_sales,
			generated_bills,
			week_appointments,
			low_stock_products,
			total_inventory_value,
			total_products_in_stock,
			total_customers,
			new_customers_this_month,
			total_active_products,
			products_by_category,
			average_price_by_category,
			most_popular_categories,
		] = await Promise.all([
			dashboard_repository.total_sales_today(),
			dashboard_repository.total_sales_week(),
			dashboard_repository.total_sales_month(),
			dashboard_repository.sales_trend(),
			dashboard_repository.sales_by_payment_method(),
			dashboard_repository.top_10_products(),
			dashboard_repository.top_10_treatments(),
			dashboard_repository.latest_sales(),
			dashboard_repository.generated_bills(),
			dashboard_repository.week_appointments(),
			dashboard_repository.low_stock_products(),
			dashboard_repository.total_inventory_value(),
			dashboard_repository.total_products_in_stock(),
			dashboard_repository.total_customers(),
			dashboard_repository.new_customers_this_month(),
			dashboard_repository.total_active_products(),
			dashboard_repository.products_by_category(),
			dashboard_repository.average_price_by_category(),
			dashboard_repository.most_popular_categories(),
		]);

		return {
			sales: {
				total_today: total_sales_today,
				total_week: total_sales_week,
				total_month: total_sales_month,
				trend: sales_trend,
				by_payment_method: sales_by_payment_method,
				top_products: top_10_products,
				top_treatments: top_10_treatments,
				latest: latest_sales,
				bills: generated_bills,
			},
			appointments: {
				this_week: week_appointments,
			},
			inventory: {
				low_stock: low_stock_products,
				total_value: total_inventory_value,
				total_products: total_products_in_stock,
			},
			customers: {
				total: total_customers,
				new_this_month: new_customers_this_month,
			},
			catalog: {
				total_active_products: total_active_products,
				products_by_category,
				average_price_by_category,
				most_popular_categories,
			},
		};
	},
};
