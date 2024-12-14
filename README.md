# **Bot de Trading Automatizado para Binance**

Este proyecto busca resolver el problema de generar ingresos pasivos a largo plazo sin necesidad de monitorear constantemente el mercado o realizar trabajo manual. Este bot permite hacer crecer tus ahorros con un nivel de riesgo controlado, eliminando la necesidad de conocimientos avanzados en trading o programación.

---

## **Inspiración**

El bot fue creado con el objetivo de combinar conocimientos de programación y trading, automatizando procesos complejos. Nació como una oportunidad para:

- Poner en práctica habilidades en Node.js y APIs.
- Entrar al mundo del trading sin la necesidad de monitorear constantemente indicadores.
- Automatizar estrategias para crear una "máquina de crecimiento de ahorros" eficiente y confiable.

---

## **¿A quién está dirigido?**

El bot está diseñado para:

- Personas interesadas en criptomonedas que desean generar ingresos pasivos.
- Usuarios sin experiencia previa en trading o programación.
- Aquellos que quieran optimizar su tiempo y minimizar riesgos mientras generan ganancias.

---

## **Beneficios del Bot**

1. Solo necesitas una computadora para ejecutarlo.
2. No se requiere conocimiento de programación.
3. No necesitas experiencia previa en trading.
4. Es rentable a mediano y largo plazo.
5. Está en constante crecimiento con nuevas actualizaciones.
6. Se lanzarán más bots con funcionalidades mejoradas.
7. Construiremos una comunidad para compartir resultados y retroalimentación.

---

## **¿Qué hace el bot?**

El bot realiza compras y ventas automáticas tras analizar el contexto del mercado y evaluar estrategias optimizadas. Está diseñado específicamente para el par **BTC/USDT** en gráficos de 1 hora. Aunque puede usarse en intervalos menores (como 15 minutos o 5 minutos), su funcionamiento óptimo se encuentra en el marco temporal de 1 hora.

---

## **Estrategia de Operación**

### **Indicadores utilizados**

- EMA de 8 y 26 períodos en el RSI.
- EMA de 20 períodos en el gráfico de velas.
- Soportes y resistencias.

### **Funcionamiento**

1. **Contexto del mercado:**

   - Analiza el gráfico de 4 horas para identificar zonas clave de soporte y resistencia.
   - Determina si el precio está en una posición que minimice riesgos y garantice ganancias.

2. **Condiciones de entrada:**

   - Cruce alcista de la EMA de 8 sobre la EMA de 26 en el RSI.
   - El RSI debe estar por encima de 50.
   - La vela anterior debe cerrar en verde por encima de la EMA de 20.

3. **Condiciones de salida:**
   - Venta automática al alcanzar el stop-loss.
   - Venta tras un cruce bajista de la EMA de 8 por debajo de la EMA de 26 en el RSI y cierre de vela en rojo por debajo de la EMA de 20.

---

## **Resultados del Backtesting**

El bot fue probado en el par **BTC/USDT** desde **2023-01-01 a 2024-12-10**:

- **Total de operaciones**: 102
- **Promedio de operaciones por mes**: 4.25
- **Operaciones ganadoras**: 47
- **Operaciones perdedoras**: 55
- **Stop-loss activado**: 31 veces
- **Ganancia total**: 26.89 USDT
- **Pérdida total**: 9.95 USDT
- **Ganancia neta total**: 16.94 USDT (26.89 USDT - 9.95 USDT)
- **Win rate**: 46.08%
  - El **Win rate** indica el porcentaje de operaciones ganadoras en relación con el total de operaciones realizadas. En este caso, el bot tuvo éxito en el 46.08% de las operaciones, lo que significa que casi la mitad de las transacciones generaron ganancias.
- **Profit factor**: 2.7

  - El **Profit factor** mide la relación entre las ganancias totales y las pérdidas totales. Un valor de 2.7 significa que por cada 1 USDT perdido, el bot generó 2.7 USDT en ganancias, lo que demuestra una estrategia rentable a largo plazo.

- **Rendimiento promedio por operación ganadora**: 2.35%
- **Rendimiento promedio entre todas las operaciones**: 1.32%
- **Rendimiento total sobre el capital inicial**: ~84.7%
- **Rendimiento anualizado**: ~38%

### **Análisis detallado**

Cada operación fue abierta con un capital inicial de 20 USDT. Después de 102 operaciones, el bot generó una **ganancia neta total de 16.94 USDT**, lo que equivale a un rendimiento acumulado del **84.7%** sobre el capital inicial de 20 USDT.

El periodo de análisis fue de aproximadamente 23 meses, lo que permite anualizar el rendimiento de la siguiente manera:  
El capital inicial de 20 USDT creció a 36.94 USDT (20 + 16.94), lo que equivale a un crecimiento anualizado aproximado del **38%**.

### **Corrección de cálculos**

En la versión anterior, se afirmaba que el rendimiento anual era del 134.45%, pero este cálculo fue incorrecto porque no consideraba las pérdidas totales. Al restar las pérdidas (9.95 USDT) de las ganancias (26.89 USDT), se obtiene una ganancia neta de 16.94 USDT, que representa el rendimiento real.

### **Comparación con inversiones tradicionales**

Comparado con inversiones tradicionales, como cuentas de ahorro bancarias que ofrecen rendimientos menores al 5% anual, este bot proporciona una alternativa altamente rentable dentro del contexto del mercado de criptomonedas, especialmente para estrategias automatizadas de trading.

---

## **Seguridad**

1. **Claves API protegidas:** Las claves API se almacenan en un archivo `.env` local que nunca se expone públicamente.
2. **Gestión de riesgos:** Incluye medidas como stop-loss y análisis de contexto para minimizar pérdidas.
3. **Recomendación:** Puedes usarlo con una cuenta principal o de prueba en Binance.

---

## **Instalación y Uso**

1. Descarga [Node.js](https://nodejs.org) e instala Visual Studio Code (o cualquier editor de texto).
2. Clona el repositorio desde GitHub:
   ```bash
   git clone <URL-del-repositorio>
   cd <nombre-del-repositorio>
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Crea un archivo `.env` y añade tus claves API de Binance:
   ```plaintext
   BINANCE_API_KEY=tu_clave
   BINANCE_API_SECRET=tu_secreto
   ```
5. Ejecuta el bot:
   ```bash
   node index.js
   ```

### **Tiempo de configuración**

- Primera instalación: 15-20 minutos (si no tienes las herramientas necesarias).
- Ejecuciones posteriores: menos de 2 minutos.

---

## **Próximos Pasos**

Planeo agregar más estrategias y funcionalidades basadas en las necesidades y sugerencias de los usuarios. Estoy construyendo una comunidad para compartir resultados y perfeccionar el proyecto.

---

## **¿Por qué deberías probar este bot?**

- Es rentable a mediano y largo plazo.
- Automatiza estrategias avanzadas, eliminando la necesidad de conocimientos previos.
- Proporciona una solución de ingresos pasivos confiable.

---

Si tienes alguna duda, sugerencia o experiencia que compartir, no dudes en ponerte en contacto conmigo. ¡Espero tus comentarios para seguir mejorando! 🚀

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
