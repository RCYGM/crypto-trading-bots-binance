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

    //>>>>>>>>>>>>>>>>>>>>> Backtesting Data;

    this.dineoDisponible = 100;
    this.ordenId = 0;
    this.stopLossAlcanzado = false;

    this.comprasRealizadas = 0;
    this.ventasRealizadas = 0;
  }

  emarsi = (tiempo, buySell) => {
    console.log("Estoy dentro de la estrategia del backtesting emarsi");

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

      const {
        EMA10_4h,
        EMA50_4h,
        RSI14_4h,
        SR_4h,
        SMA_RSI_4h,
        ultimasVelasData_4h,
      } = this.indicadores4h;

      console.log(
        "EVALUANDO SI LA DATA LLEGA COMPLETA Y BIEN",
        "4H",
        "EMA 10",
        EMA10_4h,
        "EMA 50",
        EMA50_4h,
        "RSI14",
        RSI14_4h,
        "SR_4H",
        SR_4h,
        "SMA_RSI",
        SMA_RSI_4h,
        "ULTIMASVELAS",
        ultimasVelasData_4h,

        "15M",
        "EMA 10",
        EMA10_15m,
        "EMA 50",
        EMA50_15m,
        "RSI14",
        RSI14_15m,
        "SR_15m",
        SR_15m,
        "SMA_RSI",
        SMA_RSI_15m,
        "ULTIMASVELAS",
        ultimasVelasData_15m
      );

      const hasCruceAlcista = (ema10, ema50) => {
        console.log("ESTA ES LA EMA DE 10: ", ema10);
        console.log("ESTA ES LA EMA DE 50: ", ema50);
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error(
            "Las EMAs en hasCruceAlcista necesitan al menos dos valores."
          );
        }
        return ema10.at(-1) > ema50.at(-1) && ema10.at(-2) < ema50.at(-2);
      };
      const hasCruceBajista = (ema10, ema50) => {
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error(
            "Las EMAs en hasCruceBajista necesitan al menos dos valores."
          );
        }
        return ema10.at(-1) < ema50.at(-1) && ema10.at(-2) > ema50.at(-2);
      };

      if (buySell === "sell") {
        if (tiempo === "15m") {
          const myOperacion = this.comprasArr.find(
            (operacion) => operacion.operacionData.id === "EMA-RSI-15M"
          );

          const { stopLoss, puedoLiquidarMitad } = myOperacion.estrategiaSalida;
          const precioCompra = myOperacion.binanceOrdenData.fills.price;
          const { capitalOperacion } = myOperacion.backtestingData;
          //  console.log("Esta es la Orden que Voy a procesar: ", myOperacion);

          if (this.price <= stopLoss) {
            this.stopLossAlcanzado = true;

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
              hasCruceBajista(EMA10_15m, EMA50_15m) ||
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

              this.ventasRealizadas += 1;
              this.dineoDisponible +=
                capitalOperacion + (this.price - precioCompra);
              const orden = {
                symbol: "BTCUSDT",
                orderId: (this.ordenId += 1),
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
                    price: this.price,
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
                backtestingData: {
                  hasStopsLoss: this.stopLossAlcanzado,
                  resultado: this.price - precioCompra,
                  myCapital: this.dineoDisponible,
                  fechaApertura:
                    myOperacion.candLesticksCompra.data15m.slice(-1)[0]
                      .closeTime,
                  fechaCierre: this.data15m.slice(-1)[0].closeTime,
                  tiempoOperacion:
                    (myOperacion.candLesticksCompra.data15m.slice(-1)[0]
                      .closeTime -
                      this.data15m.slice(-1)[0].closeTime) /
                    (1000 * 60 * 60),
                },
              };
              this.stopLossAlcanzado = false;
              console.log("Tercer IF superado");
              return data;
            }
          }
        }
      }

      if (buySell === "buy") {
        if (tiempo === "15m") {
          // BUSCAMOS LONG EN MARCOS 15M

          const prueba = true;

          if (
            (SR_4h.isZona1 &&
              EMA10_4h.at(-1) > EMA50_4h.at(-1) &&
              RSI14_4h.at(-1) > 40 &&
              RSI14_4h.at(-1) < 60) ||
            prueba
          ) {
            console.log(`CONDICION IF #1 SUPERADA: SR_4h.isZona1 &&
              EMA10_4h.at(-1) > EMA50_4h.at(-1) &&
              RSI14_4h.at(-1) > 40 &&
              RSI14_4h.at(-1) < 60)`);

            if (
              (hasCruceAlcista(EMA10_15m, EMA50_15m) &&
                RSI14_15m.at(-1) > 40 &&
                RSI14_15m.at(-1) < 50 &&
                ultimasVelasData_15m.hasVolumen) ||
              prueba
            ) {
              console.log(`CONDICION IF #2 SUPERADA: (hasCruceAlcista(EMA10_15m, EMA50_15m) &&
                RSI14_15m.at(-1) > 40 &&
                RSI14_15m.at(-1) < 50 &&
                ultimasVelasData_15m.hasVolumen)`);
              const totalUSDT = this.dineoDisponible; //await balances.balance("USDT");

              const perdidaMaxima = totalUSDT * 0.02;
              const stopLoss =
                SR_4h.soporteActual - (SR_4h.soporteActual * 1) / 100;
              const distanciaStopLoss = this.price - stopLoss;
              const compra = perdidaMaxima / distanciaStopLoss;

              console.log(
                "VIENDO LOS DATOS DE LA COMPRA: ",
                "PERDIDA MAXIMA",
                perdidaMaxima,
                "stopLoss",
                stopLoss,
                "distanciaStopLoss",
                distanciaStopLoss,
                "compra",
                compra,
                "COMPRA USDT",
                compra * this.price
              );

              if ((this.price > stopLoss && compra > 0) || prueba) {
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

                this.comprasRealizadas += 1;

                const orden = {
                  symbol: "BTCUSDT",
                  orderId: (this.ordenId += 1),
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
                      price: this.price,
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
                    backtestingData: {
                      capitalOperacion: compra * this.price,
                    },
                  };
                  console.log("DATA DE RETORNO DE LA COMPRA: ", data);
                  return data;
                }
              } else {
                console.warn(
                  "Condiciones no válidas para la compra:",
                  `Precio actual (${this.price}) debe estar por encima del stopLoss (${stopLoss}), y compra (${compra}) debe ser positiva.`
                );
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
    console.log("Entre en emarsi15m");

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
      // console.log("Estas son todas las velas de esta solicitud: ", totalVelas);

      return totalVelas;
    };

    console.log("Voy a iniciar a buscar todas las velas que necesito");
    console.log("Voy a buscar totalData15m");

    const totalData15m = await getVelasData(symbol, "15m", startTime, endTime);
    //  console.log("Esto tiene totalData15m" /*totalData15m*/);

    console.log("Voy a buscar totalData4h");

    const totalData4h = await getVelasData(symbol, "4h", startTime, endTime);

    // console.log("Esto tiene totalData4h" /*totalData4h*/);
    console.log("Ya tengo todas las velas que necesito");

    console.log(`Total de velas 15m: ${totalData15m.length}`);
    console.log(`Total de velas 4h: ${totalData4h.length}`);

    const menorLongitud = Math.min(totalData15m.length, totalData4h.length);

    console.log(menorLongitud);

    const myData = {
      candLesticksData: [],
      compras: [],
      ventas: [],
      historial: [],
    };

    for (let i = 51; i < menorLongitud; i++) {
      console.log("estoy dentro del for");

      //console.log("Estoy dentro del bucle");
      console.log(`Índice actual: ${i}`);

      const obtenerIndicadores = (velas, interval) => {
        const priceBTCUSDT = velas.slice(-1)[0].close;
        console.log("Precio de cierre: ", priceBTCUSDT);
        const priceCloseArr = velas.map((item) => parseFloat(item.close));

        console.log("ESTE ES priceCloseArr", priceCloseArr.length);

        /*console.log(
          "Estan son las Velas que voy a procesar",
          velas,
          "y estoy trabajando este intervalo: ",
          interval
        );*/

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
            backtestingPrice: priceBTCUSDT,
          },
        ];

        //console.log("Hay indicadores? ", data[0].indicadores);

        return data;
      };

      const ultimasVelas15m = totalData15m.slice(i - 51, i);
      //console.log("Estas son las ultimas velas de 15m", ultimasVelas15m);

      const ultimasVelas4h = totalData4h.slice(i - 51, i);
      //console.log("Estas son las ultimas velas de 4h", ultimasVelas4h);

      console.log(`Tamaño de ultimasVelas15m: ${ultimasVelas15m.length}`);
      console.log(`Tamaño de ultimasVelas4h: ${ultimasVelas4h.length}`);

      const CopiaFake = obtenerIndicadores(ultimasVelas15m, "15m");
      const data15m = obtenerIndicadores(ultimasVelas15m, "15m");
      const data4h = obtenerIndicadores(ultimasVelas4h, "4h");

      console.log("data15m: ", data15m);
      console.log("data4h: ", data4h);

      const estrategias = new Estrategias(
        CopiaFake,
        CopiaFake,
        data15m,
        CopiaFake,
        data4h,
        CopiaFake,
        CopiaFake,
        data15m[0].backtestingPrice,
        myData.compras
      );

      //console.log("class estrategias: ", estrategias);

      // Busca compra
      if (myData.compras.length < 1) {
        console.log("myData.compras.length:", myData.compras.length);

        console.log("Voy a buscar una compra");
        console.log("Estrategias instance:", estrategias);
        const BUY_EMARSI_15M = estrategias.emarsi("15m", "buy");
        console.log("HE COMPRADO");

        console.log(BUY_EMARSI_15M);
        if (BUY_EMARSI_15M) {
          myData.compras.push(BUY_EMARSI_15M);
        }
      } else {
        console.log("NO ENCONTRE UNA COMPRA");
      }

      // Busca Venta
      /*if (myData.compras.length >= 1) {
        for (let i = 0; i < myData.compras.length; i++) {
          if (myData.compras[i].operacionData.id === "EMA-RSI-15M") {
            const SELL_EMARSI_15 = await estrategias.emarsi("15m", "sell");

            if (SELL_EMARSI_15) {
              if (SELL_EMARSI_15.compra.operacionData.status === "finalizado") {
                // ELIMINO
                const ventaId = SELL_EMARSI_15.compra.binanceOrdenData.orderId;
                const nuevoArr = myData.compras.filter(
                  (item) => item.binanceOrdenData.orderId !== ventaId
                );
                myData.compras = nuevoArr;
                this.historialOperaciones.push(SELL_EMARSI_15);
              }
            }
          }
        }
      }*/
      if (i === 52) {
        /* console.error(
            `llegue al final de menorLongitud que es ${menorLongitud} y el indice actual es ${i}`
          );*/

        console.log("FIN DEL BACKTESTING:  >>>>>>>>>>");
        console.log("COMPRAS ACTUALES: ", myData.compras);

        return this.historialOperaciones;
        break; // Salta esta iteración del bucle
      }
    }

    /*
    this.gananciaTotal = this.historialOperaciones
      .map((operacion) => operacion.backtestingData.resultado)
      .reduce((a, b) => a + b, 0);

    const operacionesPerdidas =
      this.historialOperaciones.backtestingData.filter(
        (operacion) => operacion.resultado < 0
      );
    this.perdidaTotal = operacionesPerdidas.backtestingData.resultado.reduce(
      (a, b) => a + b,
      0
    );
    this.roi =
      ((this.historialOperaciones.backtestingData[
        this.historialOperaciones.backtestingData.length - 1
      ].myCapital -
        100) /
        100) *
      100;

    const operacionesGanadas = this.historialOperaciones.backtestingData.filter(
      (operacion) => operacion.resultado > 0
    );

    this.hitRate =
      (operacionesGanadas / this.historialOperaciones.length) * 100;

    this.gananciaPromedio = this.gananciaTotal / operacionesGanadas;
    this.perdidaPromedio = this.perdidaTotal / operacionesPerdidas;

    this.totalOperaciones = this.historialOperaciones.length;
    this.operacionesGanadoras = operacionesGanadas.length;
    this.operacionesPerdedoras = operacionesPerdidas.length;
    this.mayorGanancia = this.historialOperaciones.reduce((max, operacion) => {
      return operacion.backtestingData.resultado > max.backtestingData.resultado
        ? operacion
        : max;
    }, this.historialOperaciones[0]);

    this.mayorPerdida = this.historialOperaciones.reduce((min, operacion) => {
      return operacion.backtestingData.resultado < min.backtestingData.resultado
        ? operacion
        : min;
    }, this.historialOperaciones[0]);

    // Drawdown
    this.capitalMaximo = this.historialOperaciones.reduce((max, operacion) => {
      return operacion.backtestingData.myCapital > max.backtestingData.myCapital
        ? operacion
        : max;
    }, this.historialOperaciones[0]);

    this.capitalMinimo = this.historialOperaciones.reduce((min, operacion) => {
      return operacion.backtestingData.myCapital < min.backtestingData.myCapital
        ? operacion
        : min;
    }, this.historialOperaciones[0]);

    this.drawdownMaximo =
      ((this.capitalMaximo - this.capitalMinimo) / this.capitalMaximo) * 100;

    // Análisis Temporal
    this.tiempoTotalOperaciones =
      this.historialOperaciones.backtestingData.tiempoOperacion.reduce(
        (a, b) => a + b,
        0
      );

    this.duracionPromedioOperaciones =
      this.tiempoTotalOperaciones / this.historialOperaciones.length;

    this.frecuenciaOperaciones =
      this.historialOperaciones.length / startTime - endTime; // Promedio de operaciones por unidad de tiempo: totalOperaciones / periodoTotalbacktesting.

    // Validación de la Estrategia
    // this.condicionesEntradaCumplidas = 0; // Número de veces que se cumplieron las condiciones de entrada.
    // this.condicionesSalidaCumplidas = 0; // Número de veces que se cumplieron las condiciones de salida.
    this.stopLossActivados = this.historialOperaciones.filter(
      (operacion) => operacion.backtestingData.hasStopsLoss === true
    ).length; // Número de veces que el stop-loss fue activado: operaciones cerradas por stop-loss.*/
    /*
    const data = {
      operacionesGanadas: operacionesGanadas,
      gananciaTotal: this.gananciaTotal,
      gananciaPromedio: this.gananciaPromedio,

      operacionesPerdidas: operacionesPerdidas,
      perdidaTotal: this.perdidaTotal,
      perdidaPromedio: this.perdidaPromedio,

      totalOperaciones: this.totalOperaciones,
      operacionesGanadoras: this.operacionesGanadoras,
      operacionesPerdedoras: this.operacionesPerdedoras,
      mayorGanancia: this.mayorGanancia,
      mayorPerdida: this.mayorPerdida,
      roi: this.roi,
      hitRate: this.hitRate,

      capitalMaximo: this.capitalMaximo,
      capitalMinimo: this.capitalMinimo,
      drawdownMaximo: this.drawdownMaximo,

      tiempoTotalOperaciones: this.tiempoTotalOperaciones,
      duracionPromedioOperaciones: this.duracionPromedioOperaciones,
      frecuenciaOperaciones: this.frecuenciaOperaciones,
      stopLossActivados: this.stopLossActivados,
    };
    return data;*/
  }
}

const startTime = new Date("2024-11-01T00:00:00.000Z").getTime();
const endTime = new Date().getTime();
const backtesting = new Backtesting();
console.log("start Time", startTime, "end Time", endTime);

(async () => {
  try {
    const resultado = await backtesting.emarsi15m(
      "BTCUSDT",
      startTime,
      endTime
    );
    console.log(resultado);
  } catch (error) {
    console.error("Error en backtesting:", error.message);
  }
})();
