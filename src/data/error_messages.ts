export const error_messages = {
	invalid_credentials: "Las credenciales proporcionadas no son correctas. Por favor, verifica tu email y contraseña e intenta nuevamente.",
	invalid_password: "La contraseña proporcionada es incorrecta. Por favor, verifica tu contraseña e intenta nuevamente.",
	server_url_not_defined: "El URL del servidor no está definido. Por favor, asegúrate de que la variable de entorno SERVER_URL esté configurada correctamente.",
	openai_api_key_not_defined: "La clave API del modelo de lenguaje no está definida. Por favor, asegúrate de que la variable de entorno OPENAI_API_KEY esté configurada correctamente.",
	openai_language_model_not_defined: "El modelo de lenguaje no está definido. Por favor, asegúrate de que la variable de entorno OPENAI_LANGUAGE_MODEL esté configurada correctamente.",
	openai_tool_model_not_defined: "El modelo de herramientas no está definido. Por favor, asegúrate de que la variable de entorno OPENAI_TOOL_MODEL esté configurada correctamente.",
	openai_url_not_valid: "La URL del proovedor del modelo de lenguaje no es válida o no accesible. Por favor, verifica la variable de entorno OPENAI_BASE_URL y asegúrate de que sea una URL válida.",
	// auth
	no_token_provided: "No se proporcionó un token. Por favor, incluye un token en la cabecera de autorización e intenta nuevamente.",
	invalid_token: "El token proporcionado no es válido o ha expirado. Por favor, verifica tu token e intenta nuevamente.",
	// user
	user_not_found: "Usuario no encontrado. Por favor, verifica el ID del usuario e intenta nuevamente.",
}