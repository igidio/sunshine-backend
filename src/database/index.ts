import { drizzle } from "drizzle-orm/mysql2";
import { envs } from "../config/envs";

const db = drizzle(envs.db_url);
export default db;