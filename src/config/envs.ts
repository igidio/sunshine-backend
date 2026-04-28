import { z } from 'zod'

interface Env_vars {
	port: number;
	db_url: string;
	jwt_secret: string;
	jwt_refresh: string;
}

const env_schema = z.object({
	port: z.coerce.number().default(3000),
	db_url: z.url(),
	jwt_secret: z.string().min(1),
	jwt_refresh: z.string().min(1)
});

const parseResult = env_schema.safeParse({
	port: process.env.DB_PORT,
	db_url: process.env.DB_URL,
	jwt_secret: process.env.JWT_SECRET,
	jwt_refresh: process.env.JWT_REFRESH
});

if (!parseResult.success) {
	console.error('Invalid environment variables:');
	for (const issue of parseResult.error.issues) {
		console.error(`- ${issue.path.join('.')}: ${issue.message}`);
	}
	process.exit(1);
}

export const envs: Env_vars = parseResult.data
