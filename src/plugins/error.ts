import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import Elysia, { ValidationError } from "elysia";

export const plugin_error = new Elysia().onError(({ error }) => {
	
	if (error instanceof Error) {
		if (error instanceof DrizzleQueryError) {
			return {
				message: "Database query error",
				details: error.cause?.message,
				code: "DATABASE_QUERY_ERROR"
			}
		}
		if (error instanceof DrizzleError) {
			return {
				message: "Database error",
				details: error,
				code: "DATABASE_ERROR"
			}
		}
		if (error instanceof ValidationError) {
			return {
				message: "Validation failed",
				details: error.customError,
				code: "VALIDATION_ERROR"
			}	
		}
		return {
			message: "An unexpected error occurred",
			details: error,
			code: "UNEXPECTED_ERROR"
		}
	}
}).as('global')