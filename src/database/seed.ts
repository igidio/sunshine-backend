import { getTableName } from "drizzle-orm"
import db from "."
import user_seeder from "./seeders/user.seeder"
import { MySqlTableWithColumns } from "drizzle-orm/mysql-core"
import { Seeder } from "./types"



const seed_database = async <T extends MySqlTableWithColumns<any>>(seeder: Seeder<T>) => {
	const table_name = getTableName(seeder.type);
	try {
		await db.insert(seeder.type).values(seeder.data).execute()
	} catch (error) {
		console.error(`Error seeding database '${table_name}':`, (error as any)["cause"]["sqlMessage"])
	}
}

try {
	await seed_database(user_seeder)

	console.log("finished")
} catch (error) {

} finally {
	db.$client.end()
}
