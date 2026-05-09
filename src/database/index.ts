import { drizzle } from "drizzle-orm/mysql2";
import { envs } from "../config/envs";
import { relations } from "./relations";

const db = drizzle(envs.db_url, { relations });
export default db;