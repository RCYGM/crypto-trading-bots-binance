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

const CandLesticksData = require("./candLesticksData");
const candLesticksData = new CandLesticksData();
const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

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
    //console.log("Estoy dentro de la estrategia del backtesting emarsi");

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
      /*
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
        );*/

      const hasCruceAlcista = (ema10, ema50) => {
        // console.log("ESTA ES LA EMA DE 10: ", ema10);
        //console.log("ESTA ES LA EMA DE 50: ", ema50);
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error(
            "Las EMAs en hasCruceAlcista necesitan al menos dos valores."
          );
          4;
        }
        /* console.log(
            "ESTE ES EL LOG DEL return DE hasCruceAlcista:",
            "ema10.at(-1)",
            ema10.at(-1),
            "ema50.at(-1)",
            ema50.at(-1),
            "ema10.at(-2)",
            ema10.at(-2),
            "ema50.at(-2)",
            ema50.at(-2)
          );*/

        // verifica que la distancia entre las dos emas no sea aplia. contexto en "BTCUSDT"
        const distanciaPermitida_EMA10_EMA50 =
          Math.abs(ema10.at(-1) - ema50.at(-1)) <= 300;

        // verifica que la distancia entre el precio y la ema10 no sea aplia. contexto en "BTCUSDT"
        const distanciaPermitida_PRECIO_EMA10 =
          Math.abs(this.price - ema10.at(-1)) <= 525;

        if (
          ema10.at(-1) > ema50.at(-1) &&
          distanciaPermitida_EMA10_EMA50 &&
          distanciaPermitida_PRECIO_EMA10
        ) {
          return true;
        } else {
          return false;
        }
      };

      const hasCruceBajista = (ema10, ema50) => {
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error(
            "Las EMAs en hasCruceBajista necesitan al menos dos valores."
          );
        }
        return ema10.at(-1) < ema50.at(-1);
      };

      if (buySell === "sell") {
        //  console.log("IF EXITOSO:  buySell === sell");

        if (tiempo === "15m") {
          //  console.log("IF EXITOSO:  tiempo === 15m");
          const myOperacion = this.comprasArr.find(
            (operacion) => operacion.operacionData.id === "EMA-RSI-15M"
          );
          const { stopLoss, puedoLiquidarMitad } = myOperacion.estrategiaSalida;
          const precioCompra = myOperacion.binanceOrdenData.fills[0].price;
          const { capitalOperacion } = myOperacion.backtestingData;

          /*console.log(
              "Esta es la Orden que Voy a procesar: ",
              myOperacion,
              "stopLoss",
              stopLoss,
              "puedoLiquidarMitad",
              puedoLiquidarMitad,
              "precioCompra",
              precioCompra,
              "capitalOperacion",
              capitalOperacion,
              "BUSCANDO FECHA DE APERTURA",
              myOperacion.candLesticksCompra.data15m[0].candLesticks.slice(-1)[0]
                .closeTime
            );*/

          if (this.price <= stopLoss) {
            console.log("STOPLOSS ACTIVADO: ", this.price <= stopLoss);

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
              }*/
          }
          const prueba = false;
          if (
            (this.price > myOperacion.estrategiaSalida.resistenciaZona3 &&
              puedoLiquidarMitad) ||
            (RSI14_15m.at(-1) > 60 && puedoLiquidarMitad) ||
            prueba
          ) {
            console.log(`IF PASADO CON EXITO: (this.price > myOperacion.estrategiaSalida.resistenciaZona3 &&
                puedoLiquidarMitad) ||
              (RSI14_15m.at(-1) > 60 && puedoLiquidarMitad) >>>>>>>>>>> se liquido la mitad`);

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
            console.log("IF DESPUES DE LIQUIDAR LA MITAD ACTIVADO");
            if (
              (RSI14_15m.at(-1) > 70 && SMA_RSI_15m < RSI14_15m.at(-1)) ||
              hasCruceBajista(EMA10_15m, EMA50_15m) ||
              prueba
            ) {
              console.log(`IF DE VENTA ACTIVADO (RSI14_15m.at(-1) > 70 && SMA_RSI_15m < RSI14_15m.at(-1)) ||
                hasCruceBajista(EMA10_15m, EMA50_15m)`);

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
                    myOperacion.candLesticksCompra.data15m[0].candLesticks.slice(
                      -1
                    )[0].closeTime,
                  fechaCierre:
                    this.data15m[0].candLesticks.slice(-1)[0].closeTime,
                  tiempoOperacion:
                    (myOperacion.candLesticksCompra.data15m.slice(-1)[0]
                      .closeTime -
                      this.data15m.slice(-1)[0].closeTime) /
                    (1000 * 60 * 60),
                },
              };
              this.stopLossAlcanzado = false;
              //console.log("Tercer IF superado");
              return data;
            }
          }
        }
      }

      if (buySell === "buy") {
        if (tiempo === "15m") {
          // BUSCAMOS LONG EN MARCOS 15M

          const prueba = false;

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
            /*console.log(
                "VALORES AL PASAR EL IF INICIO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
                "SR_4h.isZona1",
                SR_4h.isZona1,
  
                "EMA10_4h.at(-1)",
                EMA10_4h.at(-1),
  
                "EMA50_4h.at(-1)",
                EMA50_4h.at(-1),
  
                "EMA10_4h.at(-1) > EMA50_4h.at(-1)",
                EMA10_4h.at(-1) > EMA50_4h.at(-1),
  
                "RSI14_4h.at(-1)",
                RSI14_4h.at(-1),
  
                "RSI14_4h.at(-1) > 40",
                RSI14_4h.at(-1) > 40,
  
                "RSI14_4h.at(-1)",
                RSI14_4h.at(-1),
  
                "RSI14_4h.at(-1) < 60",
                RSI14_4h.at(-1) < 60,
                "VALORES ANTES DEL IF CIERRE <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
              );*/

            const closeTime =
              this.data15m[0].candLesticks.slice(-1)[0].closeTime;
            const fechaReal = new Date(closeTime);
            console.log(
              "hasCruceAlcista",
              hasCruceAlcista(EMA10_15m, EMA50_15m),
              "Fecha de la vela",
              fechaReal
            );
            if (hasCruceAlcista(EMA10_15m, EMA50_15m)) {
              console.log(
                "hasCruceAlcista(EMA10_15m, EMA50_15m) = ",
                hasCruceAlcista(EMA10_15m, EMA50_15m),
                "RSI14_15m.at(-1)",
                RSI14_15m.at(-1),
                "RSI14_15m.at(-1) > 40 && RSI14_15m.at(-1) < 50 &&",
                RSI14_15m.at(-1) > 40 && RSI14_15m.at(-1) < 50
                /*"ultimasVelasData_5m.hasVolumen",
                  ultimasVelasData_15m.hasVolumen*/
              );
            }
            if (
              (hasCruceAlcista(EMA10_15m, EMA50_15m) &&
                RSI14_15m.at(-1) > 40 &&
                RSI14_15m.at(-1) < 50) /*&&
                  ultimasVelasData_15m.hasVolumen*/ ||
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
              const distanciaStopLoss = Math.abs(this.price - stopLoss);
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

              //if ((this.price > stopLoss && compra > 0) || prueba) {
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
                // console.log("DATA DE RETORNO DE LA COMPRA: ", data);
                return data;
              }
              /* } else {
                  console.warn(
                    "Condiciones no válidas para la compra:",
                    `Precio actual (${this.price}) debe estar por encima del stopLoss (${stopLoss}), y compra (${compra}) debe ser positiva.`
                  );
                }*/
            }
          }
        }
      }
    } catch (error) {
      console.log("Error estrategia EMA_RSI 15m: ", error.message);
    }
  };
}

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
        // console.log("No se obtuvieron más datos, finalizando.");
        break;
      }

      totalVelas.push(...velas);
      fechaActual = velas[velas.length - 1].closeTime;

      /* console.log(
          `Solicitadas ${velas.length} velas. Fecha actualizada:`,
          new Date(fechaActual).toISOString()
        );*/

      if (fechaActual >= endTime) {
        console.log("Alcanzada la fecha final.");
        break;
      }
    } catch (error) {
      console.log("Error en el bucle de la funciongetVelasData", error.message);
      break;
    }
  }
  // console.log("Estas son todas las velas de esta solicitud: ", totalVelas);

  return totalVelas;
};

//const endTime = //Actualizar con la ultima fecha

let conteo = 0;
let llamadaBase = 0;
let symbol = "BTCUSDT";
let interval = "15m";
let limit = 1;
let price = undefined;
let llamadasVelas15m = 0;

const fechaStartBacktesting = new Date("2024-06-01T00:00:00.000Z").getTime();
const fechaEndBacktesting = new Date().getTime();

const backtesting = async () => {
  const startTime15m = new Date("2024-04-01T23:45:00.000Z").getTime();
  const endTime15m = new Date("2024-04-01T23:45:00.000Z").getTime();
  const startTime4h = new Date("2024-04-01T23:00:00.000Z").getTime();
  const endTime4h = new Date("2024-04-01T19:00:00.000Z").getTime();

  console.log("startTime15m", startTime15m, "=", new Date(startTime15m));
  console.log("startTime4h", startTime4h, "=", new Date(startTime4h));

  const banckData15m = await getVelasData(
    symbol,
    "15m",
    fechaStartBacktesting,
    fechaEndBacktesting
  );
  console.log("Total de velas banckData15m: ", banckData15m.length);

  const banckData4h = await getVelasData(
    symbol,
    "4h",
    fechaStartBacktesting,
    fechaEndBacktesting
  );
  console.log("Total de velas banckData4h: ", banckData4h.length);

  let actualizarArrData = 960;

  let data15mArr = banckData15m.slice(0, actualizarArrData); //obtengo las primeras 96 velas
  console.log(
    "ULTIMA VELA 96: ",
    data15mArr.slice(-1)[0],
    "HORA DE CIERRE = ",
    data15mArr.slice(-1)[0].closeTime,
    new Date(data15mArr.slice(-1)[0].closeTime),
    "Tengo esta cantidad de velas: ",
    data15mArr.length
  );

  const buscarVela4h = (ultimosDatos15m) => {
    const horaCierre15m = ultimosDatos15m.slice(-1)[0].closeTime;
    const vela4h = banckData4h.find(
      (vela) =>
        vela.openTime <= horaCierre15m && vela.closeTime >= horaCierre15m
    );

    console.log("vela4h", vela4h);

    if (!vela4h) {
      console.error(
        "Error: No se encontró una vela de 4 horas que coincida con la hora de cierre de la vela de 15 minutos."
      );
      throw new Error("Error al buscar la vela de 4 horas.");
    }

    const indiceVela = banckData4h.findIndex(
      (vela) => vela.close === vela4h.close
    );

    console.log("indiceVela", indiceVela);

    if (indiceVela === -1) {
      console.error(
        "Error: No se encontró el índice de la vela de 4 horas correspondiente."
      );
      throw new Error("Error al buscar el índice de la vela de 4 horas.");
    }

    return indiceVela;
  };

  let data4hArr = banckData4h.slice(0, buscarVela4h(data15mArr) + 1);
  console.log(
    "ULTIMA VELA 4h: ",
    data4hArr.slice(-1)[0],
    "HORA DE APERTURA = ",
    data4hArr.slice(-1)[0].openTime,
    new Date(data4hArr.slice(-1)[0].openTime),
    "Tengo esta cantidad de velas: ",
    data4hArr.length
  );

  const myData = {
    candLesticksData: [],
    compras: [],
    ventas: [],
    historial: [],
  };

  while (true) {
    try {
      const priceActual = data15mArr.slice(-1)[0].close;
      // console.log("priceActual", priceActual);

      const priceCloseArr_15m = data15mArr.map((item) =>
        parseFloat(item.close)
      );
      const priceCloseArr_4h = data4hArr.map((item) => parseFloat(item.close));

      const obtenerIndicadores = (velas, interval, price, priceCloseArr) => {
        const ema10 = indicadores.calculateEMA(priceCloseArr, 10);
        const ema50 = indicadores.calculateEMA(priceCloseArr, 50);
        const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);
        const smaRsi = indicadores.calculateSMA_RSI(rsi14, 14);
        const getHasVolumen = indicadores.calculateHasVolumen(velas.slice(-5));

        const sopResObj = indicadores.calculateSopRes(priceCloseArr, price);
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
        return data;
      };

      const myData15 = obtenerIndicadores(
        data15mArr,
        "15m",
        priceActual,
        priceCloseArr_15m
      );
      const myData4h = obtenerIndicadores(
        data4hArr,
        "4h",
        priceActual,
        priceCloseArr_4h
      );
      console.log("myData15", myData15);
      console.log("myData4h", myData4h);

      const copiaFake = myData15;

      const estrategias = new Estrategias(
        copiaFake,
        copiaFake,
        myData15,
        copiaFake,
        myData4h,
        copiaFake,
        copiaFake,
        priceActual,
        myData.compras
      );

      //console.log("class estrategias: ", estrategias);

      // Busca compra
      if (myData.compras.length < 1) {
        //  console.log("myData.compras.length:", myData.compras.length);

        //  console.log("Voy a buscar una compra");
        //  console.log("Estrategias instance:", estrategias);
        const BUY_EMARSI_15M = estrategias.emarsi("15m", "buy");

        if (BUY_EMARSI_15M) {
          console.log("HE COMPRADO");

          //  console.log(BUY_EMARSI_15M);
          myData.compras.push(BUY_EMARSI_15M);
        }
      } else {
        //   console.log("NO ENCONTRE UNA COMPRA");
      }

      // Busca Venta
      if (myData.compras.length >= 1) {
        console.log("BUSCANDO VENTA, MI LISTA ES DE: ", myData.compras.length);

        for (let i = 0; i < myData.compras.length; i++) {
          //    console.log("ESTOY DENTRO DE FOR DE LA LISTA DE COMPRAS");
          if (myData.compras[i].operacionData.id === "EMA-RSI-15M") {
            //    console.log("ENCONTRE UN ID LLAMADO EMA-RSI-15M");

            const SELL_EMARSI_15 = estrategias.emarsi("15m", "sell");

            if (SELL_EMARSI_15) {
              console.log("VERIFICACION DE >>>> SELL_EMARSI_15 FUE EXITOSA");

              if (SELL_EMARSI_15.compra.operacionData.status === "finalizado") {
                // ELIMINO
                const ventaId = SELL_EMARSI_15.compra.binanceOrdenData.orderId;
                const nuevoArr = myData.compras.filter(
                  (item) => item.binanceOrdenData.orderId !== ventaId
                );
                myData.compras = nuevoArr;
                /*   console.log(
                  "ESTO TIENE EL ARR DE COMPRAS DESPUES DE ELIMINAR LA OPERACION",
                  myData.compras
                );*/

                this.historialOperaciones.push(SELL_EMARSI_15);
                /*console.log(
                  "EL PUSH FUE EXITOSO? ESTE ES THIS.HISTORIALoPERACIONES",
                  this.historialOperaciones
                );*/
              }
            }
          }
        }
      }

      if (data15mArr.length >= 96) {
        console.log("data15mArr.length >= 96", data15mArr.length);
        //console.log("Esto tienen limit: ", limit);

        llamadasVelas15m++;
        actualizarArrData++;

        console.log(
          "Esta es mi longitud en data15mArr antes de la actualizacion: ",
          data15mArr.length
        );
        data15mArr = banckData15m.slice(
          Math.max(0, actualizarArrData - 960),
          actualizarArrData
        );
        console.log(
          "Esta es mi longitud en data15mArr despues de la actualizacion: ",
          data15mArr.length
        );

        if (llamadasVelas15m === 16) {
          console.log("LLAMARE UNA VELA DE 4H");
          llamadasVelas15m = 0;
          console.log(
            "Esta es mi longitud en data4hArr antes de la actualizacion: ",
            data4hArr.length
          );
          data4hArr.banckData4h.slice(
            Math.max(buscarVela4h(data15mArr) - 60),
            buscarVela4h(data15mArr) + 1
          );
          console.log(
            "Esta es mi longitud en data4hArr despues de la actualizacion: ",
            data4hArr.length
          );
        }
      } // cierre actualizacion de los datos

      /*console.log(
        "Ultima Vela 15m",
        data15mArr.slice(-1)[0],
        "endTime15m",
        endTime15m,
        "=",
        new Date(endTime15m)
      );*/

      conteo++;
      console.log("Conteo Actual", conteo);

      if (conteo >= 19) {
        console.log("Breack de la Funcion");
        break;
      }
    } catch (error) {
      console.log("Error en Backtesting", error.message);
      break;
    }
  }
};

backtesting();
