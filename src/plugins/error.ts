import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import Elysia, { ValidationError } from "elysia";

export const plugin_error = new Elysia().onError(({ error, set }) => {
	if (error instanceof DrizzleQueryError) {
		const code = (error as any).cause?.code;
		let message;
		switch (code) {
			case "ECONNREFUSED":
				message = "No se pudo conectar a la base de datos. Por favor, inténtalo de nuevo más tarde.";
				break;
			default:
				message = error.message;
		}

		return {
			message: message,
			type: "database_query_error",
			status: (error as any)["status"]
		}
	}

	const error_message = (error as any)["message"];
	const error_status = (error as any)["status"] || 500;
	set.status = error_status;
	return {
		message: error_message,
		type: error instanceof ValidationError ? "validation_error" :
			error instanceof DrizzleQueryError ? "database_query_error" :
				error instanceof DrizzleError ? "database_error" :
					"server_error",
		status: error_status
	}

}).as('global')