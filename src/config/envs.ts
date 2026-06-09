import { z } from 'zod'

interface Env_vars {
	port: number;
	db_url: string;
	server_url?: string;
	jwt_secret: string;
	jwt_refresh: string;
	openai_api_key?: string;
	openai_base_url?: string;
	openai_language_model?: string;
	openai_tool_model?: string;
	use_mailer_service?: boolean;
	mailer_url?: string;
	telegram_bot_token?: string;
}

const env_schema = z.object({
	port: z.coerce.number().default(3000),
	db_url: z.url(),
	server_url: z.string().url().optional(),
	jwt_secret: z.string().min(1),
	jwt_refresh: z.string().min(1),
	openai_api_key: z.string().min(1).optional(),
	openai_base_url: z.url().optional(),
	openai_language_model: z.string().optional(),
	openai_tool_model: z.string().optional(),
	use_mailer_service: z.coerce.boolean().optional(),
	mailer_url: z.url().optional(),
	telegram_bot_token: z.string().optional(),
});

const parseResult = env_schema.safeParse({
	port: process.env.DB_PORT,
	db_url: process.env.DB_URL,
	server_url: process.env.SERVER_URL,
	jwt_secret: process.env.JWT_SECRET,
	jwt_refresh: process.env.JWT_REFRESH,
	openai_api_key: process.env.OPENAI_API_KEY,
	openai_base_url: process.env.OPENAI_BASE_URL,
	openai_language_model: process.env.OPENAI_LANGUAGE_MODEL,
	openai_tool_model: process.env.OPENAI_TOOL_MODEL,
	use_mailer_service: process.env.USE_MAILER_SERVICE,
	mailer_url: process.env.MAILER_URL,
	telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN,
});

if (!parseResult.success) {
	console.error('Invalid environment variables:');
	for (const issue of parseResult.error.issues) {
		console.error(`- ${issue.path.join('.')}: ${issue.message}`);
	}
	process.exit(1);
}

export const envs: Env_vars = parseResult.data
