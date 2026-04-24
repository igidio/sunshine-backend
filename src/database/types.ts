import type { MySqlTableWithColumns } from "drizzle-orm/mysql-core"

export type Seeder<T extends MySqlTableWithColumns<any>> = {
	type: T
	data: T["$inferInsert"][]
} 