# crypto-trading-bots-binance

Este proyecto tiene como objetivo crear un bot rentable con la API de Binance, implementando estrategias complejas para lograr una alta rentabilidad y, al mismo tiempo, poder gestionar los riesgos. Prácticamente, es la función de un experto en trading con la de un experto en programación.

url binance-api-node: https://github.com/ViewBlock/binance-api-node

## Documentación de Funciones y Métodos de `binance-api-node`

Este apartado contiene una lista detallada de los endpoints disponibles en el paquete `binance-api-node`. Ubicado en notas-&-errores/preguntas/binance-endpoints.js. Cada sección incluye una explicación del propósito de la función.

---

- ### Funciones Básicas

## **Funciones Básicas**

- **#1 `time()` Hora del Servidor**
- **#2 `accountInfo()` Información de la Cuenta**
- **#3 `prices()` Precios Actuales**

## **Gestión de Órdenes**

- **#4 `book()` Libro de Órdenes**
- **#5 `trades()` Historial de Trades**
- **#6 `order()` Crear una Orden**
- **#7 `cancelOrder()` Cancelar Orden**
- **#8 `openOrders()` Órdenes Abiertas**
- **#9 `allOrders()` Historial Completo de Órdenes**

## **Análisis de Mercado**

- **#10 `depth()` Profundidad del Mercado**
- **#11 `exchangeInfo()` Información del Intercambio**
- **#12 `ws.ticker()` Ticker en Tiempo Real**
- **#13 `avgPrice()` Precio Promedio Ponderado**
- **#14 `dailyStats()` Estadísticas Diarias**
- **#15 `candles()` Velas Históricas**

## **Retiros y Depósitos**

- **#16 `withdraw()` Realizar un Retiro**
- **#17 `depositHistory()` Historial de Depósitos**
- **#18 `withdrawHistory()` Historial de Retiros**

## **Cuentas de Margen**

- **#19 `marginAccountInfo()` Información de la Cuenta de Margen**
- **#20 `isolatedMarginAccountInfo()` Información de Margen Aislado**
- **#21 `userDataStream()` Stream de Datos del Usuario**
- **#22 `ws.user()` Eventos en Tiempo Real del Usuario**
- **#23 `marginTransfer()` Transferencias entre Billeteras**
- **#24 `marginIsolatedTransfer()` Transferencias a Margen Aislado**
- **#25 `marginOrder()` Crear una Orden en Margen**
- **#26 `marginAllOrders()` Historial de Órdenes de Margen**
- **#27 `marginOpenOrders()` Órdenes Abiertas en Margen**
- **#28 `marginRepay()` Repago de Deudas en Margen**
- **#29 `marginLoan()` Solicitud de Préstamo en Margen**
- **#30 `marginAccountTradeList()` Historial de Trades en Margen**

## **Cuentas de Futuros**

- **#31 `futuresPrices()` Precios de Futuros**
- **#32 `futuresAccountInfo()` Información de la Cuenta de Futuros**
- **#33 `futuresOrder()` Crear una Orden en Futuros**
- **#34 `futuresLeverage()` Cambiar Apalancamiento**
- **#35 `futuresPositionRisk()` Información de Posiciones y Riesgos**
- **#36 `futuresIncome()` Historial de Ingresos en Futuros**
- **#37 `futuresOrderBook()` Libro de Órdenes de Futuros**
- **#38 `futuresTradeList()` Historial de Trades en Futuros**
- **#39 `futuresCandles()` Velas de Futuros**
- **#40 `futuresSymbolPriceTicker()` Precio Actual en Futuros**
- **#41 `futuresSymbolOrderBookTicker()` Mejor Oferta y Demanda en Futuros**
- **#42 `futuresMarkPrice()` Precio de Marca en Futuros**
- **#43 `futuresAccountTradeList()` Historial de Trades de Cuenta en Futuros**
- **#44 `futuresLiquidationOrders()` Órdenes de Liquidación en Futuros**
- **#45 `futuresFundingRate()` Tasas de Financiación de Futuros**
- **#46 `futuresTransfer()` Transferencias Internas en Futuros**
- **#47 `futuresMarginHistory()` Historial de Pagos de Margen en Futuros**
- **#48 `futuresAdjustMargin()` Ajuste de Márgenes en Futuros**
- **#49 `futuresPositionRiskAnalysis()` Análisis de Riesgos en Futuros**
- **#50 `futuresLiquidationStats()` Estadísticas de Liquidaciones en Futuros**
