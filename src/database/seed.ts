import { getTableName } from "drizzle-orm"
import { reset } from "drizzle-seed";
import type { AnyMySqlTable } from "drizzle-orm/mysql-core"

import db from "."
import logger from "~/config/pino"
import type { Seeder } from "./types"
import profile_seeder from "./seeders/profile.seeder"
import user_seeder from "./seeders/user.seeder"
import category_seeder from "./seeders/category.seeder"
import product_seeder from "./seeders/product.seeder"
import movement_seeder from "./seeders/movement.seeder"
import customer_seeder from "./seeders/customer.seeder"
import treatment_seeder from "./seeders/treatment.seeder"
import supplier_seeder from "./seeders/supplier.seeder"
import stock_seeder from "./seeders/stock.seeder"
import sale_seeder from "./seeders/sale.seeder"
import sale_product_detail_seeder from "./seeders/sale_product_detail.seeder"
import sale_treatment_detail_seeder from "./seeders/sale_treatment_detail.seeder"
import appointment_seeder from "./seeders/appointment.seeder";
import * as schema from "./schema"
import notification_seeder from "./seeders/notification.seeder";

const seed_database = async (seeder: Seeder<AnyMySqlTable>) => {
	const table_name = await getTableName(seeder.type);
	await db.insert(seeder.type).values(seeder.data).execute()
	logger.info(`table '${table_name}' seeded`);
}

async function main() {
	try {
		await reset(db, schema);
		await seed_database(profile_seeder)
		await seed_database(user_seeder)
		await seed_database(category_seeder)
		await seed_database(product_seeder)
		await seed_database(customer_seeder)
		await seed_database(treatment_seeder)
		await seed_database(supplier_seeder)
		await seed_database(stock_seeder)
		await seed_database(movement_seeder)
		await seed_database(sale_seeder)
		await seed_database(sale_product_detail_seeder)
		await seed_database(sale_treatment_detail_seeder)
		await seed_database(appointment_seeder)
		await seed_database(notification_seeder)
		logger.info("Database seeded successfully");
	} catch (error) {
		logger.error(`Error seeding database: ${(error as any)["cause"]["sqlMessage"]}`)
	} finally {
		db.$client.end()
	}

}

main()