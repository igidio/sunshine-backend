export const error_messages = {
	invalid_credentials: "Las credenciales proporcionadas no son correctas. Por favor, verifica tu email y contraseña e intenta nuevamente.",
	invalid_password: "La contraseña proporcionada es incorrecta. Por favor, verifica tu contraseña e intenta nuevamente.",
	server_url_not_defined: "El URL del servidor no está definido. Por favor, asegúrate de que la variable de entorno SERVER_URL esté configurada correctamente.",
	// openai
	openai_api_key_not_defined: "La clave API del modelo de lenguaje no está definida. Por favor, asegúrate de que la variable de entorno OPENAI_API_KEY esté configurada correctamente.",
	openai_language_model_not_defined: "El modelo de lenguaje no está definido. Por favor, asegúrate de que la variable de entorno OPENAI_LANGUAGE_MODEL esté configurada correctamente.",
	openai_tool_model_not_defined: "El modelo de herramientas no está definido. Por favor, asegúrate de que la variable de entorno OPENAI_TOOL_MODEL esté configurada correctamente.",
	openai_url_not_valid: "La URL del proovedor del modelo de lenguaje no es válida o no accesible. Por favor, verifica la variable de entorno OPENAI_BASE_URL y asegúrate de que sea una URL válida.",
	// db (general)
	create_failed: "No se pudo crear el registro. Por favor, verifica los datos proporcionados e intenta nuevamente.",
	nothing_to_update: "No se proporcionaron campos para actualizar. Por favor, incluye al menos un campo a actualizar e intenta nuevamente.",
	// auth
	no_token_provided: "No se proporcionó un token. Por favor, incluye un token en la cabecera de autorización e intenta nuevamente.",
	invalid_token: "El token proporcionado no es válido o ha expirado. Por favor, verifica tu token e intenta nuevamente.",
	// zod (general)
	invalid_date: "La fecha proporcionada no es válida. Por favor, verifica el formato de la fecha e intenta nuevamente.",
	// user
	user_not_found: "Usuario no encontrado. Por favor, verifica el ID del usuario e intenta nuevamente.",
	user_forbidden: "No tienes permisos para acceder a este recurso. Por favor, verifica tus permisos e intenta nuevamente.",
	// supplier
	supplier_not_found: "Proveedor no encontrado. Por favor, verifica el ID del proveedor e intenta nuevamente.",
	supplier_image_too_large: "La imagen proporcionada es demasiado grande. Por favor, asegúrate de que la imagen sea menor a 500KB e intenta nuevamente.",
	supplier_image_format_not_supported: "El formato de imagen proporcionado no es compatible. Por favor, asegúrate de que la imagen sea en formato JPEG o PNG e intenta nuevamente.",
	// product
	product_not_found: "Producto no encontrado. Por favor, verifica el ID del producto e intenta nuevamente.",
	// category
	category_not_found: "Categoria no encontrada. Por favor, verifica el ID de la categoria e intenta nuevamente.",
	// stock
	stock_not_found: "Stock no encontrado. Por favor, verifica el ID del stock e intenta nuevamente.",
	stock_insufficient: "El stock no puede quedar en negativo. Por favor, verifica la cantidad e intenta nuevamente.",
	// movement
	movement_not_found: "Movimiento no encontrado. Por favor, verifica el ID del movimiento e intenta nuevamente.",
        // customer
        customer_not_found: "Cliente no encontrado. Por favor, verifica el ID del cliente e intenta nuevamente.",
        customer_create_failed: "No se pudo crear el cliente.",
}