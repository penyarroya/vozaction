/**
 * Lista de frases que el sistema puede decir y que deben ser ignoradas
 * por el reconocimiento de voz para evitar que el sistema se escuche a sí mismo.
 */
export const SYSTEM_PHRASES: string[] = [
  // ============================================================
  // WELCOME COMPONENT
  // ============================================================
  'Micrófono desactivado. Di "hola" para activarlo.',
  'Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".',
  'Navegando a registro de usuario',
  'En la página de inicio puedes decir "acerca de" para más información, "iniciar sesión" para acceder, "registro" para crear una cuenta, o "volver" para ir atrás.',
  'Puedes decir "iniciar sesión" o "acerca de".',

  // ============================================================
  // LOGIN COMPONENT
  // ============================================================
  'Bienvenido a inicio de sesión. Di "usuario", "contraseña", "enviar", "limpiar campos", "leer campos", "volver", o "ayuda" para más opciones.',
  'No entendí tu petición. Prueba con "login", "acerca de" o "ayuda".',

  // ============================================================
  // REGISTER COMPONENT
  // ============================================================
  'Bienvenido al registro. Di "usuario", "correo", "contraseña", "confirmar", "nombre", "apellidos", "registrar" para enviar, "limpiar" para borrar campos, "leer campos" para escuchar el contenido, o "ayuda" para más opciones.',

  // ============================================================
  // MAINTENANCE COMPONENT
  // ============================================================
  'Bienvenido. Estamos verificando la conexión con el servidor. Por favor, espera unos segundos mientras comprobamos que todo está funcionando correctamente.',
  '¡Buenas noticias! El servidor ya está disponible. Estamos preparando todos los servicios para que puedas continuar.',
  'Lo sentimos, el servidor no está disponible en este momento. No te preocupes, estamos intentando reconectar automáticamente. Puedes esperar o pulsar el botón de reintentar.',
  'Estamos intentando reconectar con el servidor. Por favor, espera un momento mientras verificamos la conexión.',
  '¡Todo listo! El servidor ya está funcionando correctamente. Serás redirigido a la página de inicio de sesión en unos segundos para que puedas entrar con tu cuenta.',
  'Servidor disponible. Espera 15 segundos.',
  'Preparando servicios. Un momento por favor.',
  'Servidor listo. Ya puedes iniciar sesión.',
  'Listo para iniciar sesión.',
  'Estás intentando reconectar manualmente. Vamos a verificar el estado del servidor. Por favor, espera un momento.',
  'El servidor ha respondido, pero aún no está completamente listo. Vamos a seguir intentando automáticamente.',

  // ============================================================
  // FORGOT PASSWORD COMPONENT
  // ============================================================
  'Bienvenido a recuperación de contraseña. Di "correo" para escribir tu correo electrónico, "enviar" para solicitar el código, "leer campos" para escuchar lo que has escrito, o "ayuda" para más opciones.',
  'Bienvenido a recuperación de contraseña. Di "correo" para escribir tu correo electrónico, "enviar" para solicitar el código, "leer campos" para escuchar lo que has escrito, "volver" para regresar, "iniciar sesión" para ir a la pantalla de inicio de sesión, o "ayuda" para más opciones.',
  'Puedes decir: "correo" para escribir tu correo electrónico, "enviar" para solicitar el código de verificación, "leer campos" para escuchar lo que has escrito, "borrar" para limpiar el campo, "volver" para regresar, "iniciar sesión" para ir a la pantalla de inicio de sesión, o "ayuda" para repetir este mensaje.',
  'Ahora puedes decir: "código" para el código de verificación, "pegar código" para rellenar el código desde el portapapeles, "contraseña" para escribir tu nueva contraseña, "confirmar" para repetir la contraseña, "guardar" para cambiar tu contraseña, "leer campos" para escuchar lo que has escrito, "borrar" para limpiar el campo actual, "limpiar" para borrar todos los campos, "volver" para regresar, o "ayuda" para repetir este mensaje.',
  'Dime tu correo electrónico. Di "fin" o "terminar" cuando hayas terminado.',
  'Dictando correo electrónico. Texto inicial:',
  'Dime tu nueva contraseña. Di "fin" o "terminar" cuando hayas terminado.',
  'Repite tu contraseña. Di "fin" o "terminar" cuando hayas terminado.',
  'Correo guardado:',
  'Correo guardado correctamente.',
  'Listo, contraseña completada.',
  'Listo, confirmación completada.',
  'No se reconoció el correo',
  'No se reconoció la contraseña',
  'El correo no tiene un formato válido. Debe incluir @ y un dominio como .com. Puedes corregirlo manualmente o dictarlo de nuevo.',
  'Validando correo electrónico...',
  'Código enviado a tu correo. Revisa tu bandeja de entrada o spam.',
  'Actualizando contraseña...',
  '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.',
  'Código inválido o expirado. Inténtalo de nuevo.',
  'El correo electrónico es obligatorio.',
  'El formato del correo electrónico no es válido. Debe incluir un arroba y un dominio.',
  'El correo electrónico no está registrado. Verifica que lo has escrito correctamente.',
  'La contraseña es obligatoria.',
  'La contraseña debe tener al menos 9 caracteres.',
  'La contraseña debe incluir mayúscula, minúscula, número y símbolo.',
  'Debes confirmar la contraseña.',
  'Las contraseñas no coinciden.',
  'El formulario contiene errores. Revisa los campos resaltados.',
  'Falta tu correo electrónico. Di "correo" para escribirlo.',
  'Tu correo está completo. Di "enviar" para solicitar el código, o "leer campos" para escuchar lo que has escrito.',
  'Todos los campos están completos. Di "guardar" para cambiar tu contraseña, o "leer campos" para escuchar lo que has escrito.',
  'Ya has actualizado tu contraseña. Ve al login.',
  'Todos los campos están vacíos.',
  'Los campos disponibles son:',
  'Contenido del formulario:',
  'Campos vacíos:',
  'No hay campos en el formulario.',
  'Campo correo borrado.',
  'Campo contraseña borrado.',
  'Campo código de verificación borrado.',
  'Campo confirmación de contraseña borrado.',
  'El correo ya está vacío. Di "correo" para escribirlo.',
  'El campo ya está vacío. Di el nombre del campo para escribirlo.',
  'Correo borrado. Di "correo" para escribirlo de nuevo.',
  'Campo borrado. Di el nombre del campo para escribirlo.',
  'Todos los campos borrados. Di "código" para el código, "contraseña" para la nueva clave.',
  'Los campos ya están vacíos.',
  'No hay un campo activo para borrar.',
  'No se reconoce el campo activo.',
  'Campo limpiado.',
  'Volviendo al paso de correo.',
  'Volviendo al inicio de sesión.',
  'Tu contraseña ya fue actualizada. Puedes iniciar sesión.',
  'El micrófono está desactivado. Di "hola" para activarlo.',
  'Navegando a inicio de sesión.',
  'Enfocado campo de código de verificación.',
  'Código pegado correctamente.',
  'El portapapeles está vacío.',
  'El portapapeles no contiene un código de 6 dígitos. Contiene',
  'No se pudo acceder al portapapeles. Asegúrate de permitir el acceso.',
  'La contraseña no es válida. Voy a borrarla. Di "contraseña" para intentarlo de nuevo.',
  'La contraseña no cumple con los requisitos. Voy a borrarla. Di "contraseña" para intentarlo de nuevo.',
  'Contraseña válida. Ahora di "confirmar" para repetirla, o "guardar" para cambiar tu contraseña.',
  'Error: La confirmación no coincide con la contraseña. Voy a borrar el campo. Di "confirmar" para intentarlo de nuevo.',
  'Confirmación correcta. Di "guardar" para cambiar tu contraseña.',
  'Es obligatorio confirmar la contraseña.',
  'La confirmación no coincide con la contraseña.',
  'Texto actual:',
  'vacío',
  'Borrado:',
  'Borrado último carácter',
  'Campo limpiado',
  'El correo no tiene un formato válido. Debe incluir @ y un dominio como .com. Puedes corregirlo manualmente.',

  // ============================================================
  // ABOUT COMPONENT
  // ============================================================
  'Bienvenido a la página Acerca de. Puedes decir "volver" para regresar o "leer" para escuchar la información.',
  'He pausado el micrófono por inactividad. Di "hola" para reactivarlo.',
  'VozAcción, el universo de la palabra.',
  'Comandos de voz para todos.',
  'Permite interactuar con la tecnología usando solo la voz, facilitando el acceso a personas con diversas capacidades.',
  'Control total por voz, sin necesidad de clics.',
  'Diseñado para personas con movilidad reducida.',
  'Asistente inteligente que entiende comandos naturales.',
  'Versión 1.0, proyecto de accesibilidad.',

  // ============================================================
  // NOT FOUND COMPONENT (404)
  // ============================================================
  'Página no encontrada. Puedes decir "volver" para regresar, "ayuda" para ir al centro de ayuda, o "reportar" para notificar un error.'
];

/**
 * Versión en minúsculas para comparación rápida
 */
export const SYSTEM_PHRASES_LOWER: string[] = SYSTEM_PHRASES.map(p => p.toLowerCase());