/**
 * Los endpoints de la API de Binance son puntos de acceso que permiten interactuar
 * con la plataforma para realizar tareas como consultar datos de mercado, gestionar cuentas
 * y realizar operaciones de trading. Cada endpoint tiene una función específica
 * (por ejemplo, consultar precios o crear órdenes) y requiere que se envíen parámetros correctos.
 *
 * Sin herramientas adicionales, debes construir manualmente las solicitudes HTTP,
 * añadir las claves de autenticación y procesar las respuestas. Sin embargo,
 * con el paquete `binance-api-node`, todo esto se simplifica en métodos fáciles de usar,
 * que automáticamente gestionan la conexión, parámetros, seguridad y respuesta.
 */

/**
 * Ejemplo de cómo funcionan los endpoints
 *
 * Accediendo a un endpoint manualmente (sin `binance-api-node`):
 * Para obtener la hora del servidor:
 */

const axios = require("axios");

axios
  .get("https://api.binance.com/api/v3/time")
  .then((response) => {
    console.log("Hora del servidor:", response.data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

/**
 * Usando `binance-api-node`:
 * El mismo ejemplo, pero con el paquete:
 */

const Binance = require("binance-api-node").default;

const client = Binance();

client.time().then((time) => console.log("Hora del servidor:", time));

/**
 * Diferencia:
 *
 * Con `binance-api-node`, no necesitas preocuparte por construir la URL,
 * manejar la conexión o procesar la respuesta. El método `client.time()` hace todo eso
 * por ti en una sola línea de código, facilitando la integración con la API de Binance.
 * Esto permite centrarte en desarrollar tu lógica sin perder tiempo en detalles técnicos.
 */
