import type { InferInsertModel } from "drizzle-orm"
import type { AnyMySqlTable } from "drizzle-orm/mysql-core"

export type Seeder<T extends AnyMySqlTable> = {
	type: T
	data: InferInsertModel<T>[]
} 