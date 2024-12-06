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

const convertToBerlinTime = (utcTime) => {
  const date = new Date(utcTime); // UTC timestamp de Binance
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin", // Zona horaria UTC+1 Berlín
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return formatter.format(date);
};

const myData = {
  candLesticksData: [],
  ultimosIndicadores: {
    velas5m: [],
    velas15m: [],
    velas1h: [],
    velas4h: [],
  },
  compras: [],
  ventas: [],
  historial: [],
};

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
    comprasArr,
    ultimosIndicadores
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

    this.velas15m = this.data15m[0].candLesticks;

    this.ultimosIndicadores = ultimosIndicadores;

    //>>>>>>>>>>> Indicadores Formulas
    const {
      EMA10_5m,
      EMA20_5m,
      EMA50_5m,
      RSI14_5m,
      SR_5m,
      EMA_RSI8_5m,
      EMA_RSI26_5m,
      ultimasVelasData_5m,
    } = this.indicadores5m;
    this.EMA10_5m = EMA10_5m.at(-1);
    this.EMA20_5m = EMA20_5m.at(-1);
    this.EMA50_5m = EMA50_5m.at(-1);
    this.RSI14_5m = RSI14_5m.at(-1);
    this.SR_5m = SR_5m;
    this.EMA_RSI8_5m = EMA_RSI8_5m.at(-1);
    this.EMA_RSI26_5m = EMA_RSI26_5m.at(-1);
    this.ultimasVelasData_5m = ultimasVelasData_5m;

    const {
      EMA10_15m,
      EMA20_15m,
      EMA50_15m,
      RSI14_15m,
      SR_15m,
      EMA_RSI8_15m,
      EMA_RSI26_15m,
      ultimasVelasData_15m,
    } = this.indicadores15m;

    this.EMA10_15m = EMA10_15m.at(-1);
    this.EMA20_15m = EMA20_15m.at(-1);
    this.EMA50_15m = EMA50_15m.at(-1);
    this.RSI14_15m = RSI14_15m.at(-1);
    this.SR_15m = SR_15m;
    this.EMA_RSI8_15m = EMA_RSI8_15m.at(-1);
    this.EMA_RSI26_15m = EMA_RSI26_15m.at(-1);
    this.ultimasVelasData_15m = ultimasVelasData_15m;

    const {
      EMA10_4h,
      EMA20_4h,
      EMA50_4h,
      RSI14_4h,
      SR_4h,
      EMA_RSI8_4h,
      EMA_RSI26_4h,
      ultimasVelasData_4h,
    } = this.indicadores4h;
    this.EMA10_4h = EMA10_4h.at(-1);
    this.EMA20_4h = EMA20_4h.at(-1);
    this.EMA50_4h = EMA50_4h.at(-1);
    this.RSI14_4h = RSI14_4h.at(-1);
    this.SR_4h = SR_4h;
    this.EMA_RSI8_4h = EMA_RSI8_4h.at(-1);
    this.EMA_RSI26_4h = EMA_RSI26_4h.at(-1);
    this.ultimasVelasData_4h = ultimasVelasData_4h;

    //>>>>>>>>>>>>>>>>>>>>> Backtesting Data;

    this.dineoDisponible = 100;
    this.ordenId = 0;
    this.stopLossAlcanzado = false;

    this.comprasRealizadas = 0;
    this.ventasRealizadas = 0;

    //>>>>>>>> FUNCIONES

    this.hasCruceAlcista = (idCruce) => {
      if (this.ultimosIndicadores.velas15m.length >= 5) {
        switch (idCruce) {
          case "ema10-50":
            const penultimaEma10 = this.ultimosIndicadores.velas15m
              .slice(-2)[0]
              .EMA10_15m.at(-1);

            const ultimaEma10 = this.ultimosIndicadores.velas15m
              .slice(-1)[0]
              .EMA10_15m.at(-1);

            /* const penultimaEma50 = this.ultimosIndicadores.velas15m
              .slice(-2)[0]
              .EMA50_15m.at(-1);*/

            const ultimaEma50 = this.ultimosIndicadores.velas15m
              .slice(-1)[0]
              .EMA50_15m.at(-1);

            return ultimaEma10 > ultimaEma50 && penultimaEma10 < ultimaEma50;

          case "ema8-ema26-rsi":
            const rsi4toEma8 =
              this.ultimosIndicadores.velas15m.slice(-4)[0].EMA_RSI8_15m;
            // console.log("rsi4toEma8", rsi4toEma8);

            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI8_15m;
            // console.log("rsiUltEma8", rsiUltEma8);

            /*const rsiPenultimaEma26 =
              this.ultimosIndicadores.velas15m.slice(-2)[0].EMA_RSI26_15m;*/

            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI26_15m;
            // console.log("rsiUltEma26", rsiUltEma26);

            return rsiUltEma8 > rsiUltEma26 && rsi4toEma8 < rsiUltEma26;
        }
      } else {
        return false;
      }
    };

    this.hasCruceBajista = (idCruce) => {
      if (this.ultimosIndicadores.velas15m.length >= 5) {
        switch (idCruce) {
          case "ema10-50":
            const penultimaEma10 = this.ultimosIndicadores.velas15m
              .slice(-2)[0]
              .EMA10_15m.at(-1);

            const ultimaEma10 = this.ultimosIndicadores.velas15m
              .slice(-1)[0]
              .EMA10_15m.at(-1);

            /* const penultimaEma50 = this.ultimosIndicadores.velas15m
              .slice(-2)[0]
              .EMA50_15m.at(-1);*/

            const ultimaEma50 = this.ultimosIndicadores.velas15m
              .slice(-1)[0]
              .EMA50_15m.at(-1);

            return ultimaEma10 < ultimaEma50 && penultimaEma10 > ultimaEma50;

          case "ema8-ema26-rsi":
            const rsi4toEma8 =
              this.ultimosIndicadores.velas15m.slice(-4)[0].EMA_RSI8_15m;
            // console.log("rsi4toEma8", rsi4toEma8);

            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI8_15m;
            // console.log("rsiUltEma8", rsiUltEma8);

            /*const rsiPenultimaEma26 =
              this.ultimosIndicadores.velas15m.slice(-2)[0].EMA_RSI26_15m;*/

            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI26_15m;
            // console.log("rsiUltEma26", rsiUltEma26);

            return rsiUltEma8 < rsiUltEma26 && rsi4toEma8 > rsiUltEma26;
        }
      } else {
        return false;
      }
    };

    this.isRsiAlcista = (intervalo) => {
      const velasKey = `velas${intervalo}`;
      const rsi14Key = `RSI14_${intervalo}`;

      if (
        !this.indicadores15m[rsi14Key] ||
        this.indicadores15m[rsi14Key].length < 3
      ) {
        throw new Error(
          `El indicador ${rsi14Key} necesita al menos tres valores.`
        );
      }

      if (this.ultimosIndicadores.velas15m.length >= 5) {
        const ultimoRsi = this.ultimosIndicadores[velasKey]
          .slice(-1)[0]
          [rsi14Key].at(-1);
        const penultimoRsi = this.ultimosIndicadores[velasKey]
          .slice(-2)[0]
          [rsi14Key].at(-2);
        console.log(`ultimoRsi${intervalo}`, ultimoRsi);
        console.log(`penultimoRsi${intervalo}`, penultimoRsi);

        return ultimoRsi > penultimoRsi;
      } else {
        return false;
      }
    };

    this.ultimaVela = (interval) => {
      // console.log("this.data15m[0].candLesticks", this.data15m[0].candLesticks);
      // console.log("this.velas15m", this.velas15m);
      const velaKey = `this.velas${interval}`;
      //console.log("velaKey", velaKey);

      // Retorna la última vela
      console.log("Ultima Vela", velaKey.slice(-1)[0]);
      return velaKey.slice(-1)[0];
    };

    this.isUltimaVelaVerde = (ultimaVelaObj) => {
      return parseFloat(ultimaVelaObj.close) > parseFloat(ultimaVelaObj.open);
    };

    this.compra = async () => {
      try {
        const calcularDatosCompra = async (SR_4h) => {
          const totalUSDT = this.dineoDisponible; //await balances.balance("USDT");
          const perdidaMaxima = totalUSDT * 0.02;
          const stopLoss =
            SR_4h.soporteActual - (SR_4h.soporteActual * 1) / 100;
          const distanciaStopLoss = Math.abs(this.price - stopLoss);
          const compra = perdidaMaxima / distanciaStopLoss;
          return { perdidaMaxima, stopLoss, distanciaStopLoss, compra };
        };

        const { perdidaMaxima, stopLoss, distanciaStopLoss, compra } =
          await calcularDatosCompra(SR_4h);

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
      } catch (error) {
        console.log("Error en this.compra: ", error.message);
      }
    };

    this.vende = async (estrategia) => {
      const myOperacion = this.comprasArr.find(
        (operacion) => operacion.operacionData.id === estrategia
      );
      const { stopLoss, puedoLiquidarMitad } = myOperacion.estrategiaSalida;
      const precioCompra = myOperacion.binanceOrdenData.fills[0].price;
      const { capitalOperacion } = myOperacion.backtestingData;

      this.ventasRealizadas += 1;
      this.dineoDisponible += capitalOperacion + (this.price - precioCompra);

      console.log(
        "stopLoss",
        stopLoss,
        "puedoLiquidarMitad",
        puedoLiquidarMitad,
        "precioCompra",
        precioCompra,
        "capitalOperacion",
        capitalOperacion
      );

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
            myOperacion.candLesticksCompra.data15m[0].candLesticks.slice(-1)[0]
              .closeTime,
          fechaCierre: this.data15m[0].candLesticks.slice(-1)[0].closeTime,
          tiempoOperacion:
            (myOperacion.candLesticksCompra.data15m.slice(-1)[0].closeTime -
              this.data15m.slice(-1)[0].closeTime) /
            (1000 * 60 * 60),
        },
      };

      myOperacion.operacionData.status = "finalizado";
      return data;
    };
  }

  emarsi = async (interval, buySell) => {
    try {
      if (buySell === "buy") {
        const ultimaVela = this.ultimaVela(interval);

        if (this.hasCruceAlcista("ema8-ema26-rsi")) {
          if (this.RSI14_15m > 50 && this.isRsiAlcista(interval)) {
            if (
              this.isUltimaVelaVerde(ultimaVela) &&
              ultimaVela.close > EMA20_15m.at(-1)
            ) {
              const data = await this.compra();
              if (data) {
                console.log("data", data);
                return data;
              }
            }
          }
        }
      } else if (buySell === "sell") {
        const ultimaVela = this.ultimaVela(interval);
        if (this.hasCruceBajista("ema8-ema26-rsi")) {
          if (this.RSI14_15m <= 55 && !this.isRsiAlcista(interval)) {
            if (
              !this.isUltimaVelaVerde(ultimaVela) &&
              ultimaVela.close < this.EMA20_15m
            ) {
              const data = await this.vende();
              if (data) {
                return data;
              }
            }
          }
        }
        const data = await this.vende("EMA-RSI-15M");
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

const fechaStartBacktesting = new Date("2024-11-01T00:00:00.000Z").getTime();
const fechaEndBacktesting = new Date().getTime();

const backtesting = async () => {
  const startTime15m = new Date("2024-04-01T23:45:00.000Z").getTime();
  //const endTime15m = new Date("2024-04-01T23:45:00.000Z").getTime();
  const startTime4h = new Date("2024-04-01T23:00:00.000Z").getTime();
  // const endTime4h = new Date("2024-04-01T19:00:00.000Z").getTime();

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
  /* console.log(
    "ULTIMA VELA 96: ",
    data15mArr.slice(-1)[0],
    "HORA DE CIERRE = ",
    data15mArr.slice(-1)[0].closeTime,
    new Date(data15mArr.slice(-1)[0].closeTime),
    "Tengo esta cantidad de velas: ",
    data15mArr.length
  );*/

  const buscarVela4h = (ultimosDatos15m) => {
    const horaCierre15m = ultimosDatos15m.slice(-1)[0].closeTime;
    const vela4h = banckData4h.find(
      (vela) =>
        vela.openTime <= horaCierre15m && vela.closeTime >= horaCierre15m
    );

    //console.log("vela4h", vela4h);

    if (!vela4h) {
      console.error(
        "Error: No se encontró una vela de 4 horas que coincida con la hora de cierre de la vela de 15 minutos."
      );
      throw new Error("Error al buscar la vela de 4 horas.");
    }

    const indiceVela = banckData4h.findIndex(
      (vela) => vela.close === vela4h.close
    );

    // console.log("indiceVela", indiceVela);

    if (indiceVela === -1) {
      console.error(
        "Error: No se encontró el índice de la vela de 4 horas correspondiente."
      );
      throw new Error("Error al buscar el índice de la vela de 4 horas.");
    }

    return indiceVela;
  };

  let data4hArr = banckData4h.slice(0, buscarVela4h(data15mArr) + 1);
  /* console.log(
    "ULTIMA VELA 4h: ",
    data4hArr.slice(-1)[0],
    "HORA DE APERTURA = ",
    data4hArr.slice(-1)[0].openTime,
    new Date(data4hArr.slice(-1)[0].openTime),
    "Tengo esta cantidad de velas: ",
    data4hArr.length
  );*/

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
        const ema20 = indicadores.calculateEMA(priceCloseArr, 20);
        const ema50 = indicadores.calculateEMA(priceCloseArr, 50);
        const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);
        const ema_rsi8 = indicadores.calculateEMA_RSI(rsi14, 8);
        const ema_rsi26 = indicadores.calculateEMA_RSI(rsi14, 26);
        const getHasVolumen = indicadores.calculateHasVolumen(velas.slice(-5));

        const sopResObj = indicadores.calculateSopRes(priceCloseArr, price);
        const data = [
          {
            candLesticksInterval: interval,
            candLesticks: velas,
            indicadores: {
              [`EMA10_${interval}`]: ema10,
              [`EMA20_${interval}`]: ema20,
              [`EMA50_${interval}`]: ema50,
              [`RSI14_${interval}`]: rsi14,
              [`EMA_RSI8_${interval}`]: ema_rsi8,
              [`EMA_RSI26_${interval}`]: ema_rsi26,
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

      myData.ultimosIndicadores.velas15m.push(myData15[0].indicadores);
      myData.ultimosIndicadores.velas4h.push(myData4h[0].indicadores);

      if (myData.ultimosIndicadores.velas15m.length > 5) {
        myData.ultimosIndicadores.velas15m =
          myData.ultimosIndicadores.velas15m.slice(-5);
      }
      if (myData.ultimosIndicadores.velas4h.length > 5) {
        myData.ultimosIndicadores.velas4h =
          myData.ultimosIndicadores.velas4h.slice(-5);
      }
      // console.log("myData15", myData15);
      // console.log("myData4h", myData4h);

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
        myData.compras,
        myData.ultimosIndicadores
      );

      //console.log("class estrategias: ", estrategias);

      // Busca compra
      if (myData.compras.length < 1) {
        //  console.log("myData.compras.length:", myData.compras.length);

        //  console.log("Voy a buscar una compra");
        //  console.log("Estrategias instance:", estrategias);
        const BUY_EMARSI_15M = await estrategias.emarsi("15m", "buy");

        if (BUY_EMARSI_15M) {
          console.log("HE COMPRADO");
          console.log("Datos de la compra: ", BUY_EMARSI_15M);

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

            const SELL_EMARSI_15 = await estrategias.emarsi("15m", "sell");

            if (SELL_EMARSI_15) {
              console.log(">>>> SELL_EMARSI_15 FUE EXITOSA");

              if (SELL_EMARSI_15.compra.operacionData.status === "finalizado") {
                // ELIMINO
                const ventaId = SELL_EMARSI_15.compra.binanceOrdenData.orderId;
                const nuevoArr = myData.compras.filter(
                  (item) => item.binanceOrdenData.orderId !== ventaId
                );
                myData.compras = nuevoArr;
                console.log(
                  "ESTO TIENE EL ARR DE COMPRAS DESPUES DE ELIMINAR LA OPERACION",
                  myData.compras
                );

                myData.historial.push(SELL_EMARSI_15);
                /*console.log(
                  "EL PUSH FUE EXITOSO? ESTE ES THIS.HISTORIALoPERACIONES",
                  this.historialOperaciones
                );*/
              }
            }
          }
        }
      }

      /* console.log(
          "Esta es mi longitud en data15mArr antes de la actualizacion: ",
          data15mArr.length
        );*/
      llamadasVelas15m++;
      actualizarArrData++;
      data15mArr = banckData15m.slice(
        Math.max(0, actualizarArrData - 960),
        actualizarArrData
      );
      /* console.log(
          "Esta es mi longitud en data15mArr despues de la actualizacion: ",
          data15mArr.length
        );*/

      if (llamadasVelas15m === 16) {
        // console.log("LLAMARE UNA VELA DE 4H");

        /* console.log(
            "Esta es mi longitud en data4hArr antes de la actualizacion: ",
            data4hArr.length
          );*/
        llamadasVelas15m = 0;
        data4hArr = banckData4h.slice(
          Math.max(0, buscarVela4h(data15mArr) - 59),
          buscarVela4h(data15mArr) + 1
        );
        /* console.log(
            "Esta es mi longitud en data4hArr despues de la actualizacion: ",
            data4hArr.length
          );*/
      }
      // cierre actualizacion de los datos

      /*console.log(
        "Ultima Vela 15m",
        data15mArr.slice(-1)[0],
        "endTime15m",
        endTime15m,
        "=",
        new Date(endTime15m)
      );*/

      conteo++;
      // console.log("Conteo Actual", conteo);

      if (data15mArr.slice(-1)[0].closeTime >= fechaEndBacktesting) {
        console.log("Arr recorrido completo");
        break;
      }
    } catch (error) {
      console.log("Error en Backtesting", error.message);
      break;
    }
  }
};

backtesting();
