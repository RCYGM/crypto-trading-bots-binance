/**
 * Este documento explica las principales funciones y métodos disponibles en el paquete
 * `binance-api-node`. Cada método incluye una descripción detallada de su propósito y
 * un ejemplo práctico de cómo usarlo.
 */

// Importar el paquete binance-api-node y cargar las claves desde variables de entorno
const Binance = require("binance-api-node").default;
require("dotenv").config();

// Crear un cliente de Binance usando las claves de API
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

/**
 * 1. client.time()
 * Método para obtener la hora del servidor de Binance.
 * Este método devuelve un timestamp en milisegundos (formato Unix).
 */
client.time().then((time) => {
  console.log("Hora del servidor:", new Date(time).toLocaleString());
});

/**
 * 2. client.accountInfo()
 * Obtiene la información de la cuenta, incluyendo balances y configuraciones.
 * Devuelve un objeto con los balances de todas las monedas disponibles.
 */
client.accountInfo().then((info) => {
  console.log("Información de la cuenta:", info);
});

/**
 * 3. client.prices()
 * Obtiene los precios actuales de todas las monedas disponibles en Binance.
 * Devuelve un objeto donde cada clave es un par de trading (como BTCUSDT) y su precio actual.
 */
client.prices().then((prices) => {
  console.log("Precios actuales:", prices);
});

/**
 * 4. client.book({ symbol })
 * Obtiene el libro de órdenes para un par específico.
 * Devuelve las mejores órdenes de compra (bids) y venta (asks).
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client.book({ symbol: "BTCUSDT" }).then((orderBook) => {
  console.log("Libro de órdenes de BTCUSDT:", orderBook);
});

/**
 * 5. client.trades({ symbol })
 * Obtiene el historial de trades recientes para un par de trading.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client.trades({ symbol: "BTCUSDT" }).then((trades) => {
  console.log("Historial de trades de BTCUSDT:", trades);
});

/**
 * 6. client.order({ symbol, side, quantity, price })
 * Crea una nueva orden en Binance.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 * @param {string} side - "BUY" o "SELL".
 * @param {number} quantity - Cantidad a comprar/vender.
 * @param {number} price - Precio por unidad.
 */
client
  .order({
    symbol: "BTCUSDT",
    side: "BUY",
    type: "LIMIT", // Tipos: LIMIT, MARKET, STOP_LOSS, etc.
    quantity: 0.001,
    price: 50000,
  })
  .then((order) => {
    console.log("Orden creada:", order);
  })
  .catch((error) => {
    console.log("Error al crear la orden:", error.message);
  });

/**
 * 7. client.cancelOrder({ symbol, orderId })
 * Cancela una orden existente en Binance.
 * @param {string} symbol - El par de trading.
 * @param {number} orderId - ID de la orden a cancelar.
 */
client
  .cancelOrder({ symbol: "BTCUSDT", orderId: 12345678 })
  .then((result) => {
    console.log("Orden cancelada:", result);
  })
  .catch((error) => {
    console.log("Error al cancelar la orden:", error.message);
  });

/**
 * 8. client.openOrders({ symbol })
 * Obtiene todas las órdenes abiertas para un par de trading.
 * @param {string} symbol - El par de trading.
 */
client.openOrders({ symbol: "BTCUSDT" }).then((orders) => {
  console.log("Órdenes abiertas para BTCUSDT:", orders);
});

/**
 * 9. client.allOrders({ symbol })
 * Obtiene todas las órdenes (historial completo) para un par de trading.
 * @param {string} symbol - El par de trading.
 */
client.allOrders({ symbol: "BTCUSDT" }).then((orders) => {
  console.log("Historial de órdenes para BTCUSDT:", orders);
});

/**
 * 10. client.depth({ symbol })
 * Obtiene la profundidad del mercado para un par de trading.
 * Devuelve el libro de órdenes con más detalles.
 * @param {string} symbol - El par de trading.
 */
client.depth({ symbol: "BTCUSDT" }).then((depth) => {
  console.log("Profundidad del mercado de BTCUSDT:", depth);
});

/**
 * 11. client.exchangeInfo()
 * Obtiene información sobre los pares disponibles en Binance y sus restricciones.
 * Devuelve detalles como lotes mínimos, tamaños máximos, etc.
 */
client.exchangeInfo().then((info) => {
  console.log("Información del intercambio:", info);
});

/**
 * 12. client.ws
 * Acceso a WebSockets para recibir actualizaciones en tiempo real.
 * Ejemplo: Monitor de precios en tiempo real para un par de trading.
 */
const clean = client.ws.ticker("BTCUSDT", (ticker) => {
  console.log("Ticker en tiempo real:", ticker);
});

// Llama a clean() para detener el WebSocket después de usarlo.
// clean();

/**
 * 13. client.avgPrice({ symbol })
 * Obtiene el precio promedio ponderado (Weighted Average Price) de las últimas 5 minutos
 * para un par de trading.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client.avgPrice({ symbol: "BTCUSDT" }).then((avgPrice) => {
  console.log("Precio promedio ponderado de BTCUSDT:", avgPrice);
});

/**
 * 14. client.dailyStats({ symbol })
 * Obtiene estadísticas de las últimas 24 horas para un par de trading.
 * Incluye datos como precio de apertura, cierre, alto, bajo, volumen y cambios porcentuales.
 * @param {string} symbol - El par de trading (opcional; si no se especifica, devuelve estadísticas de todos los pares).
 */
client.dailyStats({ symbol: "BTCUSDT" }).then((stats) => {
  console.log("Estadísticas diarias de BTCUSDT:", stats);
});

/**
 * 15. client.candles({ symbol, interval })
 * Obtiene datos históricos de velas (candlestick) para un par de trading.
 * Devuelve información como apertura, cierre, alto, bajo y volumen para cada intervalo.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 * @param {string} interval - El intervalo de las velas (por ejemplo, "1m", "5m", "1h", "1d").
 * @param {number} limit - Número máximo de velas a devolver (máximo: 1000).
 * @param {number} startTime - Tiempos específicos para definir un rango (opcional).
 * @param {number} endTime - Tiempos específicos para definir un rango (opcional).
 */
client.candles({ symbol: "BTCUSDT", interval: "1h" }).then((candles) => {
  console.log("Velas de BTCUSDT (1h):", candles);
});

/**
 * 16. client.withdraw({ asset, address, amount, network })
 * Realiza un retiro desde tu cuenta hacia una dirección externa.
 * @param {string} asset - El activo a retirar (por ejemplo, BTC, USDT).
 * @param {string} address - La dirección de retiro.
 * @param {number} amount - La cantidad a retirar.
 * @param {string} network - (Opcional) La red a utilizar (por ejemplo, "BTC", "ETH").
 */
client
  .withdraw({
    asset: "BTC",
    address: "tu_direccion_btc",
    amount: 0.01,
  })
  .then((result) => {
    console.log("Retiro realizado:", result);
  })
  .catch((error) => {
    console.log("Error al realizar el retiro:", error.message);
  });

/**
 * 17. client.depositHistory({ asset, status })
 * Obtiene el historial de depósitos realizados en tu cuenta.
 * @param {string} asset - (Opcional) Filtra por el activo específico (por ejemplo, BTC, USDT).
 * @param {number} status - (Opcional) Filtra por el estado (0: en progreso, 1: completado, 6: fallido).
 */
client.depositHistory({ asset: "BTC" }).then((history) => {
  console.log("Historial de depósitos de BTC:", history);
});

/**
 * 18. client.withdrawHistory({ asset, status })
 * Obtiene el historial de retiros realizados en tu cuenta.
 * @param {string} asset - (Opcional) Filtra por el activo específico (por ejemplo, BTC, USDT).
 * @param {number} status - (Opcional) Filtra por el estado (0: en progreso, 1: completado, 6: fallido).
 */
client.withdrawHistory({ asset: "BTC" }).then((history) => {
  console.log("Historial de retiros de BTC:", history);
});

/**
 * 19. client.marginAccountInfo()
 * Obtiene información sobre tu cuenta de margen, incluyendo tus balances, márgenes y activos disponibles.
 * Solo es relevante si tienes habilitado el trading de margen.
 */
client.marginAccountInfo().then((info) => {
  console.log("Información de la cuenta de margen:", info);
});

/**
 * 20. client.isolatedMarginAccountInfo()
 * Obtiene información de cuentas de margen aisladas. Proporciona detalles sobre posiciones en pares específicos.
 */
client.isolatedMarginAccountInfo().then((info) => {
  console.log("Información de cuentas de margen aisladas:", info);
});

/**
 * 21. client.userDataStream()
 * Abre un stream de datos de usuario para recibir actualizaciones en tiempo real sobre tus órdenes,
 * balances y otras actividades en la cuenta.
 * Devuelve un listenKey que puedes usar para suscribirte a WebSocket.
 */
client.userDataStream().then((listenKey) => {
  console.log("Stream de datos de usuario iniciado. ListenKey:", listenKey);
});

/**
 * 22. client.ws.user()
 * Escucha eventos en tiempo real relacionados con la cuenta del usuario, como actualizaciones
 * de órdenes, balances y más. Este método utiliza WebSockets.
 */
const cleanUserStream = client.ws.user((data) => {
  console.log("Datos en tiempo real del usuario:", data);
});

// Para cerrar el WebSocket, llama a la función `cleanUserStream()`:
// cleanUserStream();

/**
 * 23. client.futuresPrices()
 * Obtiene los precios actuales para contratos de futuros.
 */
client.futuresPrices().then((prices) => {
  console.log("Precios de futuros:", prices);
});

/**
 * 24. client.futuresAccountInfo()
 * Obtiene información sobre tu cuenta de futuros, incluyendo el saldo disponible
 * y las posiciones abiertas.
 */
client.futuresAccountInfo().then((info) => {
  console.log("Información de la cuenta de futuros:", info);
});

/**
 * 25. client.futuresOrder()
 * Crea una orden en el mercado de futuros.
 * @param {string} symbol - Par de trading (por ejemplo, BTCUSDT).
 * @param {string} side - "BUY" o "SELL".
 * @param {number} quantity - Cantidad a comprar/vender.
 */
client
  .futuresOrder({
    symbol: "BTCUSDT",
    side: "BUY",
    type: "MARKET",
    quantity: 0.001,
  })
  .then((order) => {
    console.log("Orden de futuros creada:", order);
  });

/**
 * 26. client.marginOrder({ symbol, side, type, quantity, price })
 * Crea una orden en una cuenta de margen (si tienes habilitado el trading de margen).
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 * @param {string} side - "BUY" o "SELL".
 * @param {string} type - Tipo de orden ("LIMIT", "MARKET", etc.).
 * @param {number} quantity - Cantidad a comprar/vender.
 * @param {number} price - (Opcional) Precio de la orden (para órdenes LIMIT).
 */
client
  .marginOrder({
    symbol: "BTCUSDT",
    side: "BUY",
    type: "MARKET",
    quantity: 0.001,
  })
  .then((order) => {
    console.log("Orden de margen creada:", order);
  })
  .catch((error) => {
    console.log("Error al crear la orden de margen:", error.message);
  });

/**
 * 27. client.marginAllOrders({ symbol })
 * Obtiene el historial de órdenes en tu cuenta de margen para un par de trading específico.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .marginAllOrders({ symbol: "BTCUSDT" })
  .then((orders) => {
    console.log("Historial de órdenes de margen para BTCUSDT:", orders);
  })
  .catch((error) => {
    console.log(
      "Error al obtener el historial de órdenes de margen:",
      error.message
    );
  });

/**
 * 28. client.marginOpenOrders({ symbol })
 * Obtiene todas las órdenes abiertas en tu cuenta de margen para un par específico.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .marginOpenOrders({ symbol: "BTCUSDT" })
  .then((orders) => {
    console.log("Órdenes abiertas en margen para BTCUSDT:", orders);
  })
  .catch((error) => {
    console.log(
      "Error al obtener las órdenes abiertas de margen:",
      error.message
    );
  });

/**
 * 29. client.marginRepay({ asset, amount })
 * Realiza un pago para saldar una deuda en tu cuenta de margen.
 * @param {string} asset - El activo que deseas repagar (por ejemplo, BTC, USDT).
 * @param {number} amount - La cantidad a repagar.
 */
client
  .marginRepay({
    asset: "USDT",
    amount: 100,
  })
  .then((response) => {
    console.log("Deuda de margen repagada:", response);
  })
  .catch((error) => {
    console.log("Error al repagar deuda de margen:", error.message);
  });

/**
 * 30. client.marginLoan({ asset, amount })
 * Solicita un préstamo en tu cuenta de margen.
 * @param {string} asset - El activo que deseas pedir prestado (por ejemplo, BTC, USDT).
 * @param {number} amount - La cantidad a pedir prestada.
 */
client
  .marginLoan({
    asset: "USDT",
    amount: 100,
  })
  .then((response) => {
    console.log("Préstamo de margen solicitado:", response);
  })
  .catch((error) => {
    console.log("Error al solicitar préstamo de margen:", error.message);
  });

/**
 * 31. client.marginAccountTradeList({ symbol })
 * Obtiene el historial de trades realizados en tu cuenta de margen para un par específico.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .marginAccountTradeList({ symbol: "BTCUSDT" })
  .then((trades) => {
    console.log(
      "Historial de trades en cuenta de margen para BTCUSDT:",
      trades
    );
  })
  .catch((error) => {
    console.log(
      "Error al obtener el historial de trades de margen:",
      error.message
    );
  });

/**
 * 32. client.marginTransfer({ asset, amount, type })
 * Realiza una transferencia entre tu billetera principal y tu billetera de margen.
 * @param {string} asset - El activo que deseas transferir (por ejemplo, BTC, USDT).
 * @param {number} amount - La cantidad a transferir.
 * @param {number} type - El tipo de transferencia (1 para transferir a margen, 2 para transferir a billetera).
 */
client
  .marginTransfer({
    asset: "USDT",
    amount: 50,
    type: 1, // 1: Hacia margen, 2: Desde margen hacia la billetera principal.
  })
  .then((response) => {
    console.log("Transferencia de margen realizada:", response);
  })
  .catch((error) => {
    console.log("Error al realizar transferencia de margen:", error.message);
  });

/**
 * 33. client.marginIsolatedTransfer({ symbol, asset, amount, type })
 * Realiza una transferencia entre tu billetera principal y una cuenta de margen aislada.
 * @param {string} symbol - El par de trading asociado (por ejemplo, BTCUSDT).
 * @param {string} asset - El activo a transferir (por ejemplo, BTC, USDT).
 * @param {number} amount - La cantidad a transferir.
 * @param {number} type - El tipo de transferencia (1 para transferir a margen aislado, 2 para transferir desde margen aislado).
 */
client
  .marginIsolatedTransfer({
    symbol: "BTCUSDT",
    asset: "USDT",
    amount: 25,
    type: 1,
  })
  .then((response) => {
    console.log("Transferencia a margen aislado realizada:", response);
  })
  .catch((error) => {
    console.log(
      "Error al realizar transferencia a margen aislado:",
      error.message
    );
  });

/**
 * 34. client.marginMaxBorrowable({ asset })
 * Obtiene la cantidad máxima que puedes pedir prestada para un activo en tu cuenta de margen.
 * @param {string} asset - El activo (por ejemplo, BTC, USDT).
 */
client
  .marginMaxBorrowable({ asset: "USDT" })
  .then((amount) => {
    console.log(
      "Cantidad máxima que se puede pedir prestada para USDT:",
      amount
    );
  })
  .catch((error) => {
    console.log("Error al obtener cantidad máxima de préstamo:", error.message);
  });

/**
 * 35. client.marginInterestHistory({ asset })
 * Obtiene el historial de intereses pagados en tu cuenta de margen para un activo.
 * @param {string} asset - El activo (por ejemplo, BTC, USDT).
 */
client
  .marginInterestHistory({ asset: "USDT" })
  .then((history) => {
    console.log("Historial de intereses pagados para USDT:", history);
  })
  .catch((error) => {
    console.log("Error al obtener historial de intereses:", error.message);
  });

/**
 * 36. client.marginFee({ symbol })
 * Obtiene la tarifa de trading (fee) asociada con un par de trading en la cuenta de margen.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .marginFee({ symbol: "BTCUSDT" })
  .then((fee) => {
    console.log("Tarifa de trading en margen para BTCUSDT:", fee);
  })
  .catch((error) => {
    console.log("Error al obtener la tarifa de margen:", error.message);
  });

/**
 * 37. client.marginInterestRateHistory({ asset })
 * Obtiene el historial de tasas de interés aplicadas a un activo en la cuenta de margen.
 * @param {string} asset - El activo (por ejemplo, BTC, USDT).
 */
client
  .marginInterestRateHistory({ asset: "USDT" })
  .then((rates) => {
    console.log("Historial de tasas de interés para USDT:", rates);
  })
  .catch((error) => {
    console.log(
      "Error al obtener historial de tasas de interés:",
      error.message
    );
  });

/**
 * 38. client.futuresAccountBalance()
 * Obtiene el balance de tu cuenta de futuros, incluyendo saldo disponible y balances por activo.
 */
client
  .futuresAccountBalance()
  .then((balances) => {
    console.log("Balance de la cuenta de futuros:", balances);
  })
  .catch((error) => {
    console.log("Error al obtener el balance de futuros:", error.message);
  });

/**
 * 39. client.futuresLeverage({ symbol, leverage })
 * Cambia el apalancamiento (leverage) de un par en tu cuenta de futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 * @param {number} leverage - El nuevo apalancamiento (por ejemplo, 10).
 */
client
  .futuresLeverage({ symbol: "BTCUSDT", leverage: 10 })
  .then((response) => {
    console.log("Apalancamiento cambiado:", response);
  })
  .catch((error) => {
    console.log("Error al cambiar el apalancamiento:", error.message);
  });

/**
 * 40. client.futuresPositionRisk()
 * Obtiene información sobre el riesgo y las posiciones abiertas en tu cuenta de futuros.
 * Incluye datos como precio de liquidación, margen utilizado y más.
 */
client
  .futuresPositionRisk()
  .then((positions) => {
    console.log("Posiciones y riesgos de futuros:", positions);
  })
  .catch((error) => {
    console.log(
      "Error al obtener posiciones de riesgo de futuros:",
      error.message
    );
  });

/**
 * 41. client.futuresIncome({ symbol, incomeType, startTime, endTime })
 * Obtiene el historial de ingresos de la cuenta de futuros (por ejemplo, ganancias o pérdidas).
 * @param {string} symbol - (Opcional) El par de trading.
 * @param {string} incomeType - (Opcional) Tipo de ingreso ("TRANSFER", "REALIZED_PNL", etc.).
 * @param {number} startTime - (Opcional) Tiempo de inicio (timestamp Unix en milisegundos).
 * @param {number} endTime - (Opcional) Tiempo de fin (timestamp Unix en milisegundos).
 */
client
  .futuresIncome({ symbol: "BTCUSDT", incomeType: "REALIZED_PNL" })
  .then((income) => {
    console.log("Historial de ingresos de futuros:", income);
  })
  .catch((error) => {
    console.log("Error al obtener historial de ingresos:", error.message);
  });

/**
 * 42. client.futuresOrderBook({ symbol, limit })
 * Obtiene el libro de órdenes para un par en el mercado de futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 * @param {number} limit - (Opcional) Número máximo de órdenes a mostrar (por defecto, 100).
 */
client
  .futuresOrderBook({ symbol: "BTCUSDT", limit: 50 })
  .then((orderBook) => {
    console.log("Libro de órdenes de futuros para BTCUSDT:", orderBook);
  })
  .catch((error) => {
    console.log(
      "Error al obtener el libro de órdenes de futuros:",
      error.message
    );
  });

/**
 * 43. client.futuresTradeList({ symbol })
 * Obtiene el historial de trades recientes en el mercado de futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresTradeList({ symbol: "BTCUSDT" })
  .then((trades) => {
    console.log("Historial de trades en futuros para BTCUSDT:", trades);
  })
  .catch((error) => {
    console.log(
      "Error al obtener historial de trades en futuros:",
      error.message
    );
  });

/**
 * 44. client.futuresCandles({ symbol, interval })
 * Obtiene datos históricos de velas (candlestick) en el mercado de futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 * @param {string} interval - Intervalo de tiempo de las velas (por ejemplo, "1m", "5m", "1h").
 */
client
  .futuresCandles({ symbol: "BTCUSDT", interval: "1h" })
  .then((candles) => {
    console.log("Velas históricas de futuros para BTCUSDT (1h):", candles);
  })
  .catch((error) => {
    console.log("Error al obtener velas históricas de futuros:", error.message);
  });

/**
 * 45. client.futuresSymbolPriceTicker({ symbol })
 * Obtiene el precio actual para un par en el mercado de futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresSymbolPriceTicker({ symbol: "BTCUSDT" })
  .then((price) => {
    console.log("Precio actual de futuros para BTCUSDT:", price);
  })
  .catch((error) => {
    console.log("Error al obtener el precio de futuros:", error.message);
  });

/**
 * 46. client.futuresSymbolOrderBookTicker({ symbol })
 * Obtiene la mejor oferta (bid) y mejor demanda (ask) para un par en futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresSymbolOrderBookTicker({ symbol: "BTCUSDT" })
  .then((orderBookTicker) => {
    console.log(
      "Mejor oferta y demanda en futuros para BTCUSDT:",
      orderBookTicker
    );
  })
  .catch((error) => {
    console.log("Error al obtener la oferta y demanda:", error.message);
  });

/**
 * 47. client.futuresMarkPrice({ symbol })
 * Obtiene el precio de marca (Mark Price) para un par en el mercado de futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresMarkPrice({ symbol: "BTCUSDT" })
  .then((markPrice) => {
    console.log("Precio de marca de futuros para BTCUSDT:", markPrice);
  })
  .catch((error) => {
    console.log("Error al obtener el precio de marca:", error.message);
  });

/**
 * 48. client.futuresAccountTradeList({ symbol })
 * Obtiene el historial de trades realizados en tu cuenta de futuros para un par.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresAccountTradeList({ symbol: "BTCUSDT" })
  .then((trades) => {
    console.log(
      "Historial de trades en cuenta de futuros para BTCUSDT:",
      trades
    );
  })
  .catch((error) => {
    console.log(
      "Error al obtener historial de trades de cuenta de futuros:",
      error.message
    );
  });

/**
 * 49. client.futuresLiquidationOrders({ symbol })
 * Obtiene órdenes de liquidación en el mercado de futuros para un par.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresLiquidationOrders({ symbol: "BTCUSDT" })
  .then((orders) => {
    console.log("Órdenes de liquidación de futuros para BTCUSDT:", orders);
  })
  .catch((error) => {
    console.log("Error al obtener órdenes de liquidación:", error.message);
  });

/**
 * 50. client.futuresFundingRate({ symbol })
 * Obtiene el historial de tasas de financiación (Funding Rate) para un par en futuros.
 * @param {string} symbol - El par de trading (por ejemplo, BTCUSDT).
 */
client
  .futuresFundingRate({ symbol: "BTCUSDT" })
  .then((fundingRate) => {
    console.log("Tasas de financiación de futuros para BTCUSDT:", fundingRate);
  })
  .catch((error) => {
    console.log("Error al obtener tasas de financiación:", error.message);
  });
