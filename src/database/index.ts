import { drizzle } from "drizzle-orm/mysql2";
import { envs } from "../config/envs";

const db = drizzle(envs.database);
export default db;