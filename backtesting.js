const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

const Binance = require("binance-api-node").default;

// Cargar credenciales desde el archivo .env
require("dotenv").config();
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  useServerTime: true, // Activa la sincronización con el servidor de Binance
});
client
  .time()
  .then((time) => {
    console.log(
      "Hora del servidor de Binance:",
      new Date(time).toLocaleString()
    );
  })
  .catch((error) => {
    console.log("Error al conenctar con Binance:", error.message);
  });
class Estrategias {
  constructor(
    data1m,
    data5m,
    data15m,
    data30m,
    data4h,
    data1d,
    data1w,
    price,
    comprasArr
  ) {
    this.data1m = data1m;
    this.data5m = data5m;
    this.data15m = data15m;
    this.data30m = data30m;
    this.data4h = data4h;
    this.data1d = data1d;
    this.data1w = data1w;
    this.price = price;
    this.comprasArr = comprasArr;
    this.indicadores1m = this.data1m[0].indicadores;
    this.indicadores5m = this.data5m[0].indicadores;
    this.indicadores15m = this.data15m[0].indicadores;
    this.indicadores30m = this.data30m[0].indicadores;
    this.indicadores4h = this.data4h[0].indicadores;
    this.indicadores1d = this.data1d[0].indicadores;
    this.indicadores1w = this.data1w[0].indicadores;
  }

  emarsi = async (tiempo, buySell) => {
    try {
      const {
        EMA10_5m,
        EMA50_5m,
        RSI14_5m,
        SR_5m,
        SMA_RSI_5m,
        ultimasVelasData_5m,
      } = this.indicadores5m;

      const {
        EMA10_15m,
        EMA50_15m,
        RSI14_15m,
        SR_15m,
        SMA_RSI_15m,
        ultimasVelasData_15m,
      } = this.indicadores15m;
      /*
        console.log(
          "Informacion Velas 15m",
          EMA10_15m,
          EMA50_15m,
          RSI14_15m,
          SR_15m,
          SMA_RSI_15m,
          ultimasVelasData_15m
        );*/
      const {
        EMA10_4h,
        EMA50_4h,
        RSI14_4h,
        SR_4h,
        SMA_RSI_4h,
        ultimasVelasData_4h,
      } = this.indicadores4h;

      const isAlcista = (ema10, ema50) => {
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error("Las EMAs necesitan al menos dos valores.");
        }
        return ema10.at(-1) > ema50.at(-1) && ema10.at(-2) < ema50.at(-2);
      };
      const isBajista = (ema10, ema50) => {
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error("Las EMAs necesitan al menos dos valores.");
        }
        return ema10.at(-1) < ema50.at(-1) && ema10.at(-2) > ema50.at(-2);
      };

      // console.log("Esto es lo que quiero ver", this.data5m, this.data15m, this.data4h, this.price);
      // console.log("4h", SR_4h, "15m", SR_15m, "5m", SR_5m);

      if (buySell === "sell") {
        // const price = await client.prices().then(prices => prices.BTCUSDT)
        console.log("ESTOY EVALUANDO CONDICIONES DE VENTA");
        const myOperacion = this.comprasArr.find(
          (operacion) => operacion.operacionData.id === "EMA-RSI-15M"
        );
        const { stopLoss, puedoLiquidarMitad } = myOperacion.estrategiaSalida;
        console.log("Esta es la Orden que Voy a procesar: ", myOperacion);

        if (this.price <= stopLoss) {
          /*
            try {
              const orden = await client.order({
                symbol: "BTCUSDT",
                side: "SELL",
                type: "MARKET",
                quantity: 0.001,
              });
            } catch (error) {
              console.log("Error al realizar la compra", error.message);
            }
    */
        }
        const prueba = false;
        if (
          (this.price > myOperacion.estrategiaSalida.resistenciaZona3 &&
            puedoLiquidarMitad) ||
          (RSI14_15m.at(-1) > 60 && puedoLiquidarMitad) ||
          prueba
        ) {
          myOperacion.estrategiaSalida.puedoLiquidarMitad = false;
          // liquida el 50% y actualiza el objeto para que no liquide el otro 50% en la siguiente vuelta

          /*
            try {
              const orden = await client.order({
                symbol: "BTCUSDT",
                side: "SELL",
                type: "MARKET",
                quantity: 0.001,
              });
            } catch (error) {
              console.log("Error al realizar la compra", error.message);
            }
    */
        }

        if (!myOperacion.estrategiaSalida.puedoLiquidarMitad) {
          console.log("Segundo IF superado");
          if (
            (RSI14_15m.at(-1) > 70 && SMA_RSI_15m < RSI14_15m.at(-1)) ||
            isBajista(EMA10_15m, EMA50_15m) ||
            prueba
          ) {
            // liquida el 100%
            /*try {
              const orden = await client.order({
                symbol: "BTCUSDT",
                side: "SELL",
                type: "MARKET",
                quantity: 0.001,
              });
            } catch (error) {
              console.log("Error al realizar la compra", error.message);
            }
    */

            const orden = {
              symbol: "BTCUSDT",
              orderId: 123456789,
              orderListId: -1,
              clientOrderId: "abc123",
              transactTime: 1732761123456,
              price: "0.00000000",
              origQty: "0.001",
              executedQty: "0.001",
              cummulativeQuoteQty: "50.0",
              status: "FILLED",
              timeInForce: "GTC",
              type: "MARKET",
              side: "BUY",
              fills: [
                {
                  price: "50000.00",
                  qty: "0.001",
                  commission: "0.00000005",
                  commissionAsset: "BTC",
                  tradeId: 987654321,
                },
              ],
            };

            myOperacion.operacionData.status = "finalizado";

            const data = {
              venta: {
                candLesticksVenta: {
                  data5m: this.data5m,
                  data15m: this.data15m,
                  data4h: this.data4h,
                },
                binanceOrdenData: orden,
              },
              compra: myOperacion,
            };
            console.log("Tercer IF superado");
            return data;
          }
        }
      }

      if (buySell === "buy") {
        if (tiempo === "15m") {
          // BUSCAMOS LONG EN MARCOS 15M
          console.log(
            "Objeto soporte Resistencia: ",
            SR_4h,
            "Ultimas Velas 15m",
            ultimasVelasData_15m
          );
          const prueba = false;
          if (
            (SR_4h.isZona1 &&
              EMA10_4h.at(-1) > EMA50_4h.at(-1) &&
              RSI14_4h.at(-1) > 40 &&
              RSI14_4h.at(-1) < 60) ||
            prueba
          ) {
            console.log("Precio en la zona1");

            console.log(
              "EMA10_4h > EMA50_4h && RSI14_4h > 40 && RSI14_4h < 60"
            );
            if (
              (isAlcista(EMA10_15m, EMA50_15m) &&
                RSI14_15m.at(-1) > 40 &&
                RSI14_15m.at(-1) < 50 &&
                ultimasVelasData_15m.hasVolumen) ||
              prueba
            ) {
              console.log(
                "EMA10_15m > EMA50_15m && RSI14_15m > 40 && RSI14_15m < 50"
              );
              const totalUSDT = 100; //await balances.balance("USDT");

              const perdidaMaxima = totalUSDT * 0.02;
              const stopLoss =
                SR_4h.soporteActual - (SR_4h.soporteActual * 1) / 100;
              const distanciaStopLoss = this.price - stopLoss;
              const compra = perdidaMaxima / distanciaStopLoss;

              console.log(
                "stopLoss",
                stopLoss,
                "perdida Maxima",
                perdidaMaxima,
                "distanciaStopLoss",
                distanciaStopLoss,
                "Tamaño de la Posicion",
                compra,
                "compra en USDT",
                compra * this.price
              );

              if (compra) {
                /*try {
                      const orden = await client.order({
                        symbol: "BTCUSDT",
                        side: "BUY",
                        type: "MARKET",
                        quantity: compra,
                      });
                    } catch (error) {
                      console.log("Error al realizar la compra", error.message);
                    }*/
                const orden = {
                  symbol: "BTCUSDT",
                  orderId: 123456789,
                  orderListId: -1,
                  clientOrderId: "abc123",
                  transactTime: 1732761123456,
                  price: "0.00000000",
                  origQty: "0.001",
                  executedQty: "0.001",
                  cummulativeQuoteQty: "50.0",
                  status: "FILLED",
                  timeInForce: "GTC",
                  type: "MARKET",
                  side: "BUY",
                  fills: [
                    {
                      price: "50000.00",
                      qty: "0.001",
                      commission: "0.00000005",
                      commissionAsset: "BTC",
                      tradeId: 987654321,
                    },
                  ],
                };

                if (orden) {
                  const data = {
                    operacionData: {
                      id: "EMA-RSI-15M",
                      status: "curso",
                    },
                    estrategiaSalida: {
                      stopLoss: stopLoss,
                      puedoLiquidarMitad: true,
                      perdidaMaxima: perdidaMaxima,
                      resistenciaZona1:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona1,
                      resistenciaZona2:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona2,
                      resistenciaZona3:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona3,
                      resistenciaZona4:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona4,
                      SR_4h: SR_4h,
                    },
                    candLesticksCompra: {
                      data5m: this.data5m,
                      data15m: this.data15m,
                      data4h: this.data4h,
                    },
                    binanceOrdenData: orden,
                  };
                  return data;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error estrategia EMA_RSI 15m: ", error.message);
    }
  };
}

class Backtesting {
  constructor(/*symbol, interval, limit, price, startTime, endTime*/) {
    /*this.symbol = symbol;
    this.interval = interval;
    this.limit = limit;
    this.price = price;
    this.startTime = startTime;
    this.endTime = endTime;*/

    // Métricas de Rendimiento
    // Métricas de Rendimiento
    this.gananciaTotal = 0; // Total de ganancias en todas las operaciones: ganancia acumulada de operaciones ganadoras.
    this.perdidaTotal = 0; // Total de pérdidas en todas las operaciones: pérdida acumulada de operaciones perdedoras.
    this.roi = 0; // Retorno sobre la inversión: (capitalFinal - capitalInicial) / capitalInicial * 100.
    this.hitRate = 0; // Tasa de acierto: (operacionesGanadoras / totalOperaciones) * 100.
    this.gananciaPromedio = 0; // Ganancia promedio por operación ganadora: gananciaTotal / operacionesGanadoras.
    this.perdidaPromedio = 0; // Pérdida promedio por operación perdedora: perdidaTotal / operacionesPerdedoras.

    // Estadísticas de Operaciones
    this.totalOperaciones = 0; // Total de operaciones realizadas: operacionesGanadoras + operacionesPerdedoras.
    this.operacionesGanadoras = 0; // Número de operaciones con ganancia: operaciones cuyo resultado fue positivo.
    this.operacionesPerdedoras = 0; // Número de operaciones con pérdida: operaciones cuyo resultado fue negativo.
    this.mayorGanancia = 0; // Mayor ganancia en una operación: máximo valor en las operaciones ganadoras.
    this.mayorPerdida = 0; // Mayor pérdida en una operación: máximo valor en las operaciones perdedoras (en negativo).

    // Drawdown
    this.capitalMaximo = 0; // Capital máximo alcanzado durante el backtesting.
    this.capitalMinimo = 0; // Capital mínimo alcanzado durante el backtesting.
    this.drawdownMaximo = 0; // Máxima pérdida relativa desde el capital máximo: (capitalMaximo - capitalMinimo) / capitalMaximo * 100.

    // Análisis Temporal
    this.duracionPromedioOperaciones = 0; // Duración promedio de operaciones: tiempoTotalOperaciones / totalOperaciones.
    this.tiempoTotalOperaciones = 0; // Tiempo total acumulado de operaciones: suma de (tiempo de cierre - tiempo de apertura) para todas las operaciones.
    this.frecuenciaOperaciones = 0; // Promedio de operaciones por unidad de tiempo: totalOperaciones / periodoTotalBacktesting.

    // Validación de la Estrategia
    this.condicionesEntradaCumplidas = 0; // Número de veces que se cumplieron las condiciones de entrada.
    this.condicionesSalidaCumplidas = 0; // Número de veces que se cumplieron las condiciones de salida.
    this.stopLossActivados = 0; // Número de veces que el stop-loss fue activado: operaciones cerradas por stop-loss.

    // Almacén de Operaciones
    this.historialOperaciones = []; // Array para almacenar los detalles de cada operación: incluye precios, tiempos, ganancias/pérdidas, etc.
  }

  async emarsi15m(symbol, startTime, endTime) {
    const getVelasData = async (symbol, interval, startTime, endTime) => {
      const UN_ANO_MS = 365 * 24 * 60 * 60 * 1000; // 365 días

      // Validación del rango de tiempo
      if (endTime - startTime > UN_ANO_MS) {
        throw new Error(
          "El rango de tiempo no puede exceder un año. Ajusta las fechas."
        );
      }
      let fechaActual = startTime;
      let totalVelas = [];

      while (fechaActual < endTime) {
        try {
          const velas = await client.candles({
            symbol: symbol,
            interval: interval,
            limit: 1000, // Máximo permitido por la API
            startTime: fechaActual,
          });
          if (velas.length === 0) {
            console.log("No se obtuvieron más datos, finalizando.");
            break;
          }

          totalVelas.push(...velas);
          fechaActual = velas[velas.length - 1].closeTime;

          console.log(
            `Solicitadas ${velas.length} velas. Fecha actualizada:`,
            new Date(fechaActual).toISOString()
          );

          if (fechaActual >= endTime) {
            console.log("Alcanzada la fecha final.");
            break;
          }
        } catch (error) {
          console.log(
            "Error en el bucle de la funciongetVelasData",
            error.message
          );
          break;
        }
      }
      return totalVelas;
    };

    const totalData15m = await getVelasData(symbol, "15m", startTime, endTime);
    const totalData4h = await getVelasData(symbol, "4h", startTime, endTime);

    for (let i = 50; i < totalData15m.length; i++) {
      const myData = {
        candLesticksData: [],
        compras: [],
        ventas: [],
        historial: [],
      };

      const priceBTCUSDT = totalData15m[i].closeTime;

      const obtenerIndicadores = (velas) => {
        const priceCloseArr = velas.map((item) => parseFloat(item.close));

        const ema10 = indicadores.calculateEMA(priceCloseArr, 10);
        const ema50 = indicadores.calculateEMA(priceCloseArr, 50);
        const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);
        const smaRsi = indicadores.calculateSMA_RSI(rsi14, 14);
        const getHasVolumen = indicadores.calculateHasVolumen(velas.slice(-5));

        const sopResObj = indicadores.calculateSopRes(
          priceCloseArr,
          priceBTCUSDT
        );
        const data = [
          {
            candLesticksInterval: interval,
            candLesticks: velas,
            indicadores: {
              [`EMA10_${interval}`]: ema10,
              [`EMA50_${interval}`]: ema50,
              [`RSI14_${interval}`]: rsi14,
              [`SMA_RSI_${interval}`]: smaRsi,
              [`ultimasVelasData_${interval}`]: {
                ultimasVelas: velas.slice(-5),
                hasVolumen:
                  getHasVolumen.hasVolumen3velas ||
                  getHasVolumen.hasVolumen5velas,
                hasVolumen3Velas: getHasVolumen.hasVolumen3velas,
                hasVolumen5Velas: getHasVolumen.hasVolumen5velas,
              },
              [`SR_${interval}`]: sopResObj,
            },
          },
        ];

        // console.log("Datos de las Velas Empaquetados y enviados");

        return data;
      };
      const ultimasVelas15m = totalData15m.slice(i - 50, i);
      const ultimasVelas4h = totalData4h.slice(i - 50, i);

      const CopiaFake = obtenerIndicadores(ultimasVelas15m);
      const data15m = obtenerIndicadores(ultimasVelas15m);
      const data4h = obtenerIndicadores(ultimasVelas4h);

      const estrategias = new Estrategias(
        CopiaFake,
        CopiaFake,
        data15m,
        CopiaFake,
        data4h,
        CopiaFake,
        CopiaFake,
        priceBTCUSDT,
        myData.compras
      );

      // Busca compra
      if (myData.compras.length < 1) {
        console.log("Estoy Buscando una estrategia");

        const BUY_EMARSI_15M = await estrategias.emarsi("15m", "buy");

        if (BUY_EMARSI_15M) {
          console.log(">>>>> COMPRE  EN BUY_EMARSI_15M");
          myData.compras.push(BUY_EMARSI_15M);
          console.log(
            ">>>>> LO ENVIE A LA LISTA DE COMPRAS Y ESTO ES LO QUE TIENE LA LISTA: ",
            myData.compras
          );
        } else {
          console.log(">>>>> NO ENCONTRE OPORTUNIDAD");
        }
      }

      // Busca Venta
      if (myData.compras.length >= 1) {
        console.log(
          "Tengo una lista de compra pendiente de: ",
          myData.compras.length
        );

        for (let i = 0; i < myData.compras.length; i++) {
          console.log(
            "Voy a analizar la estrategia de cada una de las compras para ver si cumple con la estrategia de salida"
          );

          if (myData.compras[i].operacionData.id === "EMA-RSI-15M") {
            console.log(
              "Estoy Analizando la compra con la estrategia id >EMA-RSI-15M<"
            );

            const SELL_EMARSI_15 = await estrategias.emarsi("15m", "sell");

            if (SELL_EMARSI_15) {
              console.log(
                "La estrategia con id >EMA-RSI-15M se cumplio con EXITO<"
              );

              if (SELL_EMARSI_15.compra.operacionData.status === "finalizado") {
                // ELIMINO
                const ventaId = SELL_EMARSI_15.compra.binanceOrdenData.orderId;
                const nuevoArr = myData.compras.filter(
                  (item) => item.binanceOrdenData.orderId !== ventaId
                );
                myData.compras = nuevoArr;
                myData.historial.push(SELL_EMARSI_15);
                console.log(
                  "Lista de compra pendiente: ",
                  myData.compras.length
                );
                console.log("Historial de operaciones: ", myData.historial);
              }
            } else {
              console.log(">>>>> NO HUBO VENTA");
            }
          }
        }
      }
    }
  }
}

const startTime = new Date("2024-05-01T00:00:00.000Z").getTime();
const endTime = new Date().getTime();
const backtesting = new Backtesting();
console.log("start Time", startTime, "end Time", endTime);

const prueba = backtesting.emarsi15m("BTCUSDT", startTime, endTime);

console.log(prueba);
