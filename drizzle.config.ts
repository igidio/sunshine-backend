import { defineConfig } from "drizzle-kit";
import { envs } from "./src/config/envs";
export default defineConfig({
  dialect: "mysql",	
  schema: "./src/database/schema.ts",
  dbCredentials: {
    url: envs.db_url
  },
});