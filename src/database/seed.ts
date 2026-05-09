import { getTableName } from "drizzle-orm"
import { reset } from "drizzle-seed";
import type { AnyMySqlTable } from "drizzle-orm/mysql-core"

import db from "."
import logger from "~/config/pino"
import type { Seeder } from "./types"
import profile_seeder from "./seeders/profile.seeder"
import user_seeder from "./seeders/user.seeder"
import product_seeder from "./seeders/product.seeder"
import customer_seeder from "./seeders/customer.seeder"
import * as schema from "./schema"

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
		await seed_database(product_seeder)
		await seed_database(customer_seeder)

		logger.info("Database seeded successfully");
	} catch (error) {
		logger.error(`Error seeding database: ${(error as any)["cause"]["sqlMessage"]}`)
	} finally {
		db.$client.end()
	}

}

main()