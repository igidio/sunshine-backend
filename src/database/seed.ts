import { getTableName } from "drizzle-orm"
import db from "."
import user_seeder from "./seeders/user.seeder"
import type { MySqlTableWithColumns } from "drizzle-orm/mysql-core"
import type { Seeder } from "./types"
import logger from "~/config/pino"
import productSeeder from "./seeders/product.seeder"

const seed_database = async <T extends MySqlTableWithColumns<any>>(seeder: Seeder<T>) => {
	const table_name = getTableName(seeder.type);
	try {
		await db.insert(seeder.type).values(seeder.data).execute()
	} catch (error) {
		logger.error(`Error seeding database '${table_name}': ${(error as any)["cause"]["sqlMessage"]}`)
	}
}

try {
	await seed_database(user_seeder)
	await seed_database(productSeeder)

	console.log("finished")
} catch (error) {

} finally {
	db.$client.end()
}
