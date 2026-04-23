import { z } from 'zod'

interface Env_vars {
	port: number;
	password: string;
	database: string;
}

const env_schema = z.object({
	port: z.coerce.number().default(3000),
	password: z.string().min(8).max(100),
	database: z.string().min(2).max(100)
});

const parseResult = env_schema.safeParse({
	port: process.env.DB_PORT,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

if (!parseResult.success) {
	console.error('Invalid environment variables:');
	for (const issue of parseResult.error.issues) {
		console.error(`- ${issue.path.join('.')}: ${issue.message}`);
	}
	process.exit(1);
}

export const envs: Env_vars = parseResult.data
