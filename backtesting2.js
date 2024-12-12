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

const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

class Estrategias {
  constructor(data15m, data1h, data4h, price, comprasArr, ultimosIndicadores) {
    // console.log("data15m en el constructor", data15m[0].indicadores);

    //Data General
    this.data15m = data15m;
    this.data1h = data1h;
    this.data4h = data4h;
    this.price = price;
    this.comprasArr = comprasArr;

    //Velas en el presente
    this.velas15m = this.data15m[0].candLesticks;
    this.velas1h = this.data1h[0].candLesticks;

    // Indicadores
    this.indicadores15m = this.data15m[0].indicadores;
    this.indicadores1h = this.data1h[0].indicadores;
    this.indicadores4h = this.data4h[0].indicadores;
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

    this.EMA10_15m = EMA10_15m; // Arr
    this.EMA20_15m = EMA20_15m; // Arr
    this.EMA50_15m = EMA50_15m; // Arr
    this.RSI14_15m = RSI14_15m; // Arr
    this.SR_15m = SR_15m; // Obj
    this.EMA_RSI8_15m = EMA_RSI8_15m; // Number
    this.EMA_RSI26_15m = EMA_RSI26_15m; // Number
    this.ultimasVelasData_15m = ultimasVelasData_15m; // Arr => Obj

    const {
      EMA10_1h,
      EMA20_1h,
      EMA50_1h,
      RSI14_1h,
      SR_1h,
      EMA_RSI8_1h,
      EMA_RSI26_1h,
      ultimasVelasData_1h,
    } = this.indicadores1h;

    const {
      r2: r2_1h,
      r1: r1_1h,
      pp: pp_1h,
      s1: s1_1h,
      s2: s2_1h,
      resistenciaActual: resistenciaActual_1h,
      soporteActual: soporteActual_1h,
      isZona1: isZona1_1h,
      isZona2: isZona2_1h,
      isZona3: isZona3_1h,
      isZona4: isZona4_1h,
      resistenciaZona1: resistenciaZona1_1h,
      resistenciaZona2: resistenciaZona2_1h,
      resistenciaZona3: resistenciaZona3_1h,
      resistenciaZona4: resistenciaZona4_1h,
    } = SR_1h;

    this.r2_1h = r2_1h;
    this.r1_1h = r1_1h;
    this.pp_1h = pp_1h;
    this.s1_1h = s1_1h;
    this.s2_1h = s2_1h;
    this.resistenciaActual_1h = resistenciaActual_1h;
    this.soporteActual_1h = soporteActual_1h;
    this.isZona1_1h = isZona1_1h;
    this.isZona2_1h = isZona2_1h;
    this.isZona3_1h = isZona3_1h;
    this.isZona4_1h = isZona4_1h;
    this.resistenciaZona1_1h = resistenciaZona1_1h;
    this.resistenciaZona2_1h = resistenciaZona2_1h;
    this.resistenciaZona3_1h = resistenciaZona3_1h;
    this.resistenciaZona4_1h = resistenciaZona4_1h;

    this.EMA10_1h = EMA10_1h; // Arr
    this.EMA20_1h = EMA20_1h; // Arr
    this.EMA50_1h = EMA50_1h; // Arr
    this.RSI14_1h = RSI14_1h; // Arr
    this.SR_1h = SR_1h; // Obj
    this.EMA_RSI8_1h = EMA_RSI8_1h; // Number
    this.EMA_RSI26_1h = EMA_RSI26_1h; // Number
    this.ultimasVelasData_1h = ultimasVelasData_1h; // Arr => Obj

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

    const {
      r2: r2_4h,
      r1: r1_4h,
      pp: pp_4h,
      s1: s1_4h,
      s2: s2_4h,
      resistenciaActual: resistenciaActual_4h,
      soporteActual: soporteActual_4h,
      isZona1: isZona1_4h,
      isZona2: isZona2_4h,
      isZona3: isZona3_4h,
      isZona4: isZona4_4h,
      resistenciaZona1: resistenciaZona1_4h,
      resistenciaZona2: resistenciaZona2_4h,
      resistenciaZona3: resistenciaZona3_4h,
      resistenciaZona4: resistenciaZona4_4h,
    } = SR_4h;

    this.r2_4h = r2_4h;
    this.r1_4h = r1_4h;
    this.pp_4h = pp_4h;
    this.s1_4h = s1_4h;
    this.s2_4h = s2_4h;
    this.resistenciaActual_4h = resistenciaActual_4h;
    this.soporteActual_4h = soporteActual_4h;
    this.isZona1_4h = isZona1_4h;
    this.isZona2_4h = isZona2_4h;
    this.isZona3_4h = isZona3_4h;
    this.isZona4_4h = isZona4_4h;
    this.resistenciaZona1_4h = resistenciaZona1_4h;
    this.resistenciaZona2_4h = resistenciaZona2_4h;
    this.resistenciaZona3_4h = resistenciaZona3_4h;
    this.resistenciaZona4_4h = resistenciaZona4_4h;

    this.EMA10_4h = EMA10_4h; // Arr
    this.EMA20_4h = EMA20_4h; // Arr
    this.EMA50_4h = EMA50_4h; // Arr
    this.RSI14_4h = RSI14_4h; // Arr
    this.SR_4h = SR_4h; // Obj
    this.EMA_RSI8_4h = EMA_RSI8_4h; // Number
    this.EMA_RSI26_4h = EMA_RSI26_4h; // Number
    this.ultimasVelasData_4h = ultimasVelasData_4h; // Arr => Obj

    // Informacion del pasado
    this.ultimosIndicadores = ultimosIndicadores;

    // Metricas
    this.dineoDisponible = 100;
    this.isStopLoss = false;
    this.ventaResistenciaZona3 = false;
    this.ventaRsi75 = false;
    this.resistenciaActualAlcanzada = false;

    //Funciones constructoras
    this.hasCruceAlcista = (idNameFuncion) => {
      if (this.ultimosIndicadores.velas15m.length >= 5) {
        switch (idNameFuncion) {
          case "ema8_ema26_rsi15m": {
            const rsi5taEma8 =
              this.ultimosIndicadores.velas15m.slice(-4)[0].EMA_RSI8_15m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI8_15m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI26_15m;

            return rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
          }
          case "ema8_ema26_rsi1h": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas1h.slice(-10)[0].EMA_RSI8_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas1h.slice(-5)[0].EMA_RSI8_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas1h.slice(-5)[0].EMA_RSI8_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas1h.slice(-1)[0].EMA_RSI8_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas1h.slice(-1)[0].EMA_RSI26_1h;
            /* if (this.ultimaVela("1h").openTime === 1730788200000) {
              console.log("rsi10maEma8", rsi10maEma8);
              console.log("rsiUltEma8", rsiUltEma8);
              console.log("rsiUltEma26", rsiUltEma26);
              console.log(
                "rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26",
                rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26
              );
            }*/
            const cruceTardido =
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 > rsiUltEma26 && rsiPenultimaEma8 < rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false;
        }
      } else {
        return false;
      }
    };

    this.hasCruceBajista = (idNameFuncion) => {
      if (this.ultimosIndicadores.velas15m.length >= 5) {
        switch (idNameFuncion) {
          case "ema8_ema26_rsi15m":
            const rsi5taEma8 =
              this.ultimosIndicadores.velas15m.slice(-2)[0].EMA_RSI8_15m;
            // console.log("rsi5taEma8", rsi5taEma8);

            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI8_15m;
            // console.log("rsiUltEma8", rsiUltEma8);

            /*const rsiPenultimaEma26 =
              this.ultimosIndicadores.velas15m.slice(-2)[0].EMA_RSI26_15m;*/

            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA_RSI26_15m;
            // console.log("rsiUltEma26", rsiUltEma26);

            return rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false; // O el valor por defecto que desees.
        }
      } else {
        return false;
      }
    };

    this.is_RSI_Alcista = (intervalo) => {
      const velasKey = `velas${intervalo}`;
      const emaRsi8Key = `EMA_RSI8_${intervalo}`;

      if (this.ultimosIndicadores.velas15m.length >= 5) {
        const penultimoEmaRsi =
          this.ultimosIndicadores[velasKey].slice(-10)[0][emaRsi8Key];
        const ultimoEmaRsi =
          this.ultimosIndicadores[velasKey].slice(-1)[0][emaRsi8Key];

        // console.log(`ultimoRsi${intervalo}`, ultimoRsi);
        // console.log(`penultimoRsi${intervalo}`, penultimoRsi);
        // console.log("penultimoEmaRsi", penultimoEmaRsi);
        // console.log("ultimoEmaRsi", ultimoEmaRsi);

        /* if (this.ultimaVela("1h").openTime === 1730788200000) {
          console.log("velasKey", velasKey);
          console.log("emaRsi8Key", emaRsi8Key);
          console.log("penultimoEmaRsi", penultimoEmaRsi);
          console.log("ultimoEmaRsi", ultimoEmaRsi);
        }*/

        return ultimoEmaRsi > penultimoEmaRsi;
      } else {
        return false;
      }
    };

    this.ultimaVela = (interval) => {
      /*  console.log(
        "interval",
        interval,
        "this.velas15m",
        this.velas15m.slice(-1)[0]
      );*/
      switch (interval) {
        case "15m": {
          //console.log("Ultima vela 15m: ", this.velas15m.slice(-1)[0]);

          return this.velas15m.slice(-1)[0];
        }
        case "1h": {
          return this.velas1h.slice(-1)[0];
        }
        default: {
          console.error(
            `No se pudo obtener la última vela porque no encontre ${interval}.`
          );
          return false; // O maneja el error según tu lógica
        }
      }
    };

    this.isUltimaVelaVerde = (ultimaVelaObj) => {
      return parseFloat(ultimaVelaObj.close) > parseFloat(ultimaVelaObj.open);
    };

    this.encontrarOrden = (idNameFuncion) => {
      const myOperacion = this.comprasArr.find(
        (operacion) => operacion.informacion.id === idNameFuncion
      );
      return myOperacion;
    };

    this.compra = async (idNameFuncion) => {
      try {
        switch (idNameFuncion) {
          case "ema8_ema26_rsi15m": {
            const calcularDatosCompra = async () => {
              const ultimaVela = this.ultimaVela("15m");

              const inversionUsdt = 20; //await balances.balance("USDT");
              const perdidaMaxima = inversionUsdt * 0.02;
              const stopLoss = parseFloat(ultimaVela.low);
              const compra = inversionUsdt / this.price;
              return {
                perdidaMaxima,
                stopLoss,
                btc: compra,
                usdt: compra * this.price,
                compra,
              };
            };
            const { perdidaMaxima, stopLoss, btc, usdt, compra } =
              await calcularDatosCompra();

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

            /* console.log(
              "VIENDO LOS DATOS DE LA COMPRA: ",
              "PERDIDA MAXIMA",
              perdidaMaxima,
              "stopLoss",
              stopLoss,
              "btc",
              btc,
              "compra",
              compra,
              "usdt",
              usdt
            );*/
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
                  qty: "0.001",
                  commission: "0.00000005",
                  commissionAsset: "BTC",
                  tradeId: 987654321,
                },
              ],
            };

            if (orden) {
              const data = {
                informacion: {
                  id: idNameFuncion,
                  status: "curso",
                },
                metricas: {
                  fecha: new Date(),
                  fechaVela: this.ultimaVela("15m").closeTime,
                  fechaVelaBerlin: convertToBerlinTime(
                    this.ultimaVela("15m").closeTime
                  ),
                  precioCompra: this.price,
                  totalBtc: compra,
                  totalUsdt: usdt,
                  compraHasCruceAlcista: this.hasCruceAlcista(idNameFuncion),
                  compraUltimaVela: this.ultimaVela("15m"),
                  compraEMA20_15m: this.EMA20_15m.at(-1),
                  compraEMA_RSI8_15m: this.EMA_RSI8_15m,
                  compraEMA_RSI26_15m: this.EMA_RSI26_15m,
                  compraRSI14_15m: this.RSI14_15m.at(-1),
                  compraIs_RSI_Alcista: this.is_RSI_Alcista("15m"),
                },
                informacionMercado: {
                  stopLoss: stopLoss,
                  perdidaMaxima: perdidaMaxima,
                  SR_4h: SR_4h,
                },
                candLesticksCompra: {
                  velaCompra: this.ultimaVela("15m"),
                  data15m: this.data15m,
                  data4h: this.data4h,
                },
                binanceOrdenData: orden,
              };
              // console.log("DATA DE RETORNO DE LA COMPRA: ", data);
              return data;
            }
          }
          case "ema8_ema26_rsi1h": {
            const calcularDatosCompra = async () => {
              const ultimaVela = this.ultimaVela("15m");

              const inversionUsdt = 20; //await balances.balance("USDT");
              const perdidaMaxima = inversionUsdt * 0.02;
              const stopLoss = parseFloat(
                (this.price - this.price * 0.01).toFixed(2)
              ); /*parseFloat(this.ultimaVela("1h").low);*/
              //console.log("Vela", this.ultimaVela("1h"), "stopLoss", stopLoss);

              const compra = inversionUsdt / this.price;
              return {
                perdidaMaxima,
                stopLoss,
                btc: compra,
                usdt: compra * this.price,
                compra,
              };
            };
            const { perdidaMaxima, stopLoss, btc, usdt, compra } =
              await calcularDatosCompra();

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

            /* console.log(
              "VIENDO LOS DATOS DE LA COMPRA: ",
              "PERDIDA MAXIMA",
              perdidaMaxima,
              "stopLoss",
              stopLoss,
              "btc",
              btc,
              "compra",
              compra,
              "usdt",
              usdt
            );*/
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
                  qty: "0.001",
                  commission: "0.00000005",
                  commissionAsset: "BTC",
                  tradeId: 987654321,
                },
              ],
            };

            if (orden) {
              const data = {
                informacion: {
                  id: idNameFuncion,
                  status: "curso",
                },
                metricas: {
                  fecha: new Date(),
                  fechaVela: this.ultimaVela("15m").closeTime,
                  fechaVelaBerlin: convertToBerlinTime(
                    this.ultimaVela("15m").closeTime
                  ),
                  precioCompra: this.price,
                  stopLoss: stopLoss,
                  totalBtc: compra,
                  totalUsdt: usdt,
                  compraHasCruceAlcista: this.hasCruceAlcista(idNameFuncion),
                  compraUltimaVela: this.ultimaVela("15m"),

                  compraEMA20_15m: this.EMA20_15m.at(-1),
                  compraEMA_RSI8_15m: this.EMA_RSI8_15m,
                  compraEMA_RSI26_15m: this.EMA_RSI26_15m,
                  compraRSI14_15m: this.RSI14_15m.at(-1),
                  compraIs_RSI_Alcista: this.is_RSI_Alcista("15m"),

                  r2_1h: this.r2_1h,
                  r1_1h: this.r1_1h,
                  pp_1h: this.pp_1h,
                  s1_1h: this.s1_1h,
                  s2_1h: this.s2_1h,

                  resistenciaActual_1h: this.resistenciaActual_1h,
                  soporteActual_1h: this.soporteActual_1h,

                  isZona1_1h: this.isZona1_1h,
                  isZona2_1h: this.isZona2_1h,
                  isZona3_1h: this.isZona3_1h,
                  isZona4_1h: this.isZona4_1h,

                  resistenciaZona1_1h: this.resistenciaZona1_1h,
                  resistenciaZona2_1h: this.resistenciaZona2_1h,
                  resistenciaZona3_1h: this.resistenciaZona3_1h,
                  resistenciaZona4_1h: this.resistenciaZona4_1h,

                  r2_4h: this.r2_4h,
                  r1_4h: this.r1_4h,
                  pp_4h: this.pp_4h,
                  s1_4h: this.s1_4h,
                  s2_4h: this.s2_4h,

                  resistenciaActual_4h: this.resistenciaActual_4h,
                  soporteActual_4h: this.soporteActual_4h,

                  isZona1_4h: this.isZona1_4h,
                  isZona2_4h: this.isZona2_4h,
                  isZona3_4h: this.isZona3_4h,
                  isZona4_4h: this.isZona4_4h,

                  resistenciaZona1_4h: this.resistenciaZona1_4h,
                  resistenciaZona2_4h: this.resistenciaZona2_4h,
                  resistenciaZona3_4h: this.resistenciaZona3_4h,
                  resistenciaZona4_4h: this.resistenciaZona4_4h,
                },
                candLesticksCompra: {
                  velaCompra: this.ultimaVela("15m"),
                  data15m: this.data15m,
                  data1h: this.SR_1h,
                  data4h: this.data4h,
                },
                binanceOrdenData: orden,
              };
              // console.log("DATA DE RETORNO DE LA COMPRA: ", data);

              // Log para indicadores de venta en 1h
              /* console.log("indicadores:", "INDICADORES COMPRA");
              console.log(convertToBerlinTime(this.ultimaVela("1h").closeTime));
              console.log("Última Vela 1h:");
              console.log("UltimaVela:", this.ultimaVela("1h"));

              console.log("EMA y RSI en 1h:");
              console.log("EMA20_1h:", this.EMA20_1h.at(-1));
              console.log("EMA_RSI8_1h:", this.EMA_RSI8_1h);
              console.log("EMA_RSI26_1h:", this.EMA_RSI26_1h);
              console.log("RSI14_1h:", this.RSI14_1h.at(-1));

              console.log("RSI Alcista en 1h:");
              console.log("is_RSI_Alcista:", this.is_RSI_Alcista("1h"));
              // Log para soportes y resistencias de 1h
              console.log("1H Soportes y Resistencias:");
              console.log(
                "sopRes1h:",
                "Compra Soportes y resistencias en velas de 1h"
              );
              console.log("r2_1h:", this.r2_1h);
              console.log("r1_1h:", this.r1_1h);
              console.log("pp_1h:", this.pp_1h);
              console.log("s1_1h:", this.s1_1h);
              console.log("s2_1h:", this.s2_1h);

              console.log("Resistencia y Soporte Actual 1H:");
              console.log("resistenciaActual_1h:", this.resistenciaActual_1h);
              console.log("soporteActual_1h:", this.soporteActual_1h);

              console.log("Zonas de Soportes y Resistencias 1H:");
              console.log("isZona1_1h:", this.isZona1_1h);
              console.log("isZona2_1h:", this.isZona2_1h);
              console.log("isZona3_1h:", this.isZona3_1h);
              console.log("isZona4_1h:", this.isZona4_1h);

              console.log("Resistencias por Zonas 1H:");
              console.log("resistenciaZona1_1h:", this.resistenciaZona1_1h);
              console.log("resistenciaZona2_1h:", this.resistenciaZona2_1h);
              console.log("resistenciaZona3_1h:", this.resistenciaZona3_1h);
              console.log("resistenciaZona4_1h:", this.resistenciaZona4_1h);

              // Log para soportes y resistencias de 4h
              console.log("4H Soportes y Resistencias:");
              console.log(
                "sopRes4h:",
                "cOMPRA Soportes y resistencias en velas de 4h"
              );
              console.log("r2_4h:", this.r2_4h);
              console.log("r1_4h:", this.r1_4h);
              console.log("pp_4h:", this.pp_4h);
              console.log("s1_4h:", this.s1_4h);
              console.log("s2_4h:", this.s2_4h);

              console.log("Resistencia y Soporte Actual 4H:");
              console.log("resistenciaActual_4h:", this.resistenciaActual_4h);
              console.log("soporteActual_4h:", this.soporteActual_4h);

              console.log("Zonas de Soportes y Resistencias 4H:");
              console.log("isZona1_4h:", this.isZona1_4h);
              console.log("isZona2_4h:", this.isZona2_4h);
              console.log("isZona3_4h:", this.isZona3_4h);
              console.log("isZona4_4h:", this.isZona4_4h);

              console.log("Resistencias por Zonas 4H:");
              console.log("resistenciaZona1_4h:", this.resistenciaZona1_4h);
              console.log("resistenciaZona2_4h:", this.resistenciaZona2_4h);
              console.log("resistenciaZona3_4h:", this.resistenciaZona3_4h);
              console.log("resistenciaZona4_4h:", this.resistenciaZona4_4h);
              console.log(">");*/

              return data;
            }
          }
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false;
        }
      } catch (error) {
        console.log("Error en this.compra: ", error.message);
      }
    };

    this.vende = async (idNameFuncion) => {
      const { informacion, candLesticksCompra, metricas, binanceOrdenData } =
        this.encontrarOrden(idNameFuncion);

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
            qty: "0.001",
            commission: "0.00000005",
            commissionAsset: "BTC",
            tradeId: 987654321,
          },
        ],
      };

      const {
        fechaVelaBerlin,
        precioCompra,
        totalBtc,
        totalUsdt,
        compraHasCruceAlcista,
        compraUltimaVela,
        compraEMA20_15m,
        compraEMA_RSI8_15m,
        compraEMA_RSI26_15m,
        compraRSI14_15m,
        compraIs_RSI_Alcista,
        //>>>>>>>>>>>>>>>>>>>>>
        r2_1h,
        r1_1h,
        pp_1h,
        s1_1h,
        s2_1h,

        resistenciaActual_1h,
        soporteActual_1h,

        isZona1_1h,
        isZona2_1h,
        isZona3_1h,
        isZona4_1h,

        resistenciaZona1_1h,
        resistenciaZona2_1h,
        resistenciaZona3_1h,
        resistenciaZona4_1h,

        r2_4h,
        r1_4h,
        pp_4h,
        s1_4h,
        s2_4h,

        resistenciaActual_4h,
        soporteActual_4h,

        isZona1_4h,
        isZona2_4h,
        isZona3_4h,
        isZona4_4h,

        resistenciaZona1_4h,
        resistenciaZona2_4h,
        resistenciaZona3_4h,
        resistenciaZona4_4h,
        //>>>>>>>>>>>>>>>>>>>>>
      } = metricas;

      const data = {
        informacion,
        resultado: {
          transacion: "transacion",
          // fechaCompra: fechaVela,
          fechaCompraBerlin: fechaVelaBerlin,
          //fechaVenta: new Date(),
          //fechaVenta: this.ultimaVela("15m").closeTime,
          fechaVentaBerlin: convertToBerlinTime(
            this.ultimaVela("15m").closeTime
          ),
          precioCompra,
          precioVenta: this.price,
          btcOperacion: totalBtc,
          usdtOperacion: totalUsdt,
          retorno: ((this.price - precioCompra) / precioCompra) * 100,
          usdt: this.price * totalBtc,
          isGanancia: ((this.price - precioCompra) / precioCompra) * 100 > 0,
          isStopLoss: this.isStopLoss,
          ventaZona4: this.ventaResistenciaZona3,
          /* indicadoresCompra: "INDICADORES COMPRA",
          compraUltimaVela,
          compraHasCruceAlcista,
          compraEMA20_15m,
          compraEMA_RSI8_15m,
          compraEMA_RSI26_15m,
          compraRSI14_15m,
          compraIs_RSI_Alcista,*/
          /* compraSopRes1h: "Compra Soportes y resistencias en velas de 1h",
          r2_1h,
          r1_1h,
          pp_1h,
          s1_1h,
          s2_1h,

          resistenciaActual_1h,
          soporteActual_1h,

          isZona1_1h,
          isZona2_1h,
          isZona3_1h,
          isZona4_1h,

          resistenciaZona1_1h,
          resistenciaZona2_1h,
          resistenciaZona3_1h,
          resistenciaZona4_1h,
          compraSopRes4h: "Compra Soportes y resistencias en velas de 4h",
          r2_4h,
          r1_4h,
          pp_4h,
          s1_4h,
          s2_4h,

          resistenciaActual_4h,
          soporteActual_4h,

          isZona1_4h,
          isZona2_4h,
          isZona3_4h,
          isZona4_4h,

          resistenciaZona1_4h,
          resistenciaZona2_4h,
          resistenciaZona3_4h,
          resistenciaZona4_4h,
          indicadoresVenta: "INDICADORES",
          ventaUltimaVela: this.ultimaVela("1h"),
          ventaEMA20_1h: this.EMA20_1h.at(-1),
          ventaEMA_RSI8_1h: this.EMA_RSI8_1h,
          ventaEMA_RSI26_1h: this.EMA_RSI26_1h,
          ventaRSI14_1h: this.RSI14_1h.at(-1),
          ventais_RSI_Alcista: this.is_RSI_Alcista("1h"),*/
        },
        venta: {
          candLesticksVenta: {
            ultimaVela: this.ultimaVela("1h"),
            data15m: this.data15m,
            data4h: this.data4h,
          },
          binanceOrdenData: orden,
        },
        compra: {
          candLesticksCompra,
          metricas,
          binanceOrdenData,
        },
      };

      informacion.status = "finalizado";
      this.isStopLoss = false;
      this.ventaRsi75 = false;
      this.resistenciaActualAlcanzada = false;
      this.ventaResistenciaZona3 = false;

      // Log para indicadores de venta en 1h
      /* console.log("indicadores:", "INDICADORES VENTA");

      console.log(convertToBerlinTime(this.ultimaVela("1h").closeTime));

      console.log("Última Vela 1h:");
      console.log("ventaUltimaVela:", this.ultimaVela("1h"));

      console.log("EMA y RSI en 1h:");
      console.log("ventaEMA20_1h:", this.EMA20_1h.at(-1));
      console.log("ventaEMA_RSI8_1h:", this.EMA_RSI8_1h);
      console.log("ventaEMA_RSI26_1h:", this.EMA_RSI26_1h);
      console.log("ventaRSI14_1h:", this.RSI14_1h.at(-1));

      console.log("RSI Alcista en 1h:");
      console.log("ventais_RSI_Alcista:", this.is_RSI_Alcista("1h"));

      // Log para soportes y resistencias de 1h
      console.log("1H Soportes y Resistencias: VENTA ");
      console.log("sopRes1h:", "Venta Soportes y resistencias en velas de 1h");
      console.log("r2_1h:", this.r2_1h);
      console.log("r1_1h:", this.r1_1h);
      console.log("pp_1h:", this.pp_1h);
      console.log("s1_1h:", this.s1_1h);
      console.log("s2_1h:", this.s2_1h);

      console.log("Resistencia y Soporte Actual 1H:");
      console.log("resistenciaActual_1h:", this.resistenciaActual_1h);
      console.log("soporteActual_1h:", this.soporteActual_1h);

      console.log("Zonas de Soportes y Resistencias 1H:");
      console.log("isZona1_1h:", this.isZona1_1h);
      console.log("isZona2_1h:", this.isZona2_1h);
      console.log("isZona3_1h:", this.isZona3_1h);
      console.log("isZona4_1h:", this.isZona4_1h);

      console.log("Resistencias por Zonas 1H:");
      console.log("resistenciaZona1_1h:", this.resistenciaZona1_1h);
      console.log("resistenciaZona2_1h:", this.resistenciaZona2_1h);
      console.log("resistenciaZona3_1h:", this.resistenciaZona3_1h);
      console.log("resistenciaZona4_1h:", this.resistenciaZona4_1h);

      // Log para soportes y resistencias de 4h
      console.log("4H Soportes y Resistencias:");
      console.log("sopRes4h:", "Venta Soportes y resistencias en velas de 4h");
      console.log("r2_4h:", this.r2_4h);
      console.log("r1_4h:", this.r1_4h);
      console.log("pp_4h:", this.pp_4h);
      console.log("s1_4h:", this.s1_4h);
      console.log("s2_4h:", this.s2_4h);

      console.log("Resistencia y Soporte Actual 4H:");
      console.log("resistenciaActual_4h:", this.resistenciaActual_4h);
      console.log("soporteActual_4h:", this.soporteActual_4h);

      console.log("Zonas de Soportes y Resistencias 4H:");
      console.log("isZona1_4h:", this.isZona1_4h);
      console.log("isZona2_4h:", this.isZona2_4h);
      console.log("isZona3_4h:", this.isZona3_4h);
      console.log("isZona4_4h:", this.isZona4_4h);

      console.log("Resistencias por Zonas 4H:");
      console.log("resistenciaZona1_4h:", this.resistenciaZona1_4h);
      console.log("resistenciaZona2_4h:", this.resistenciaZona2_4h);
      console.log("resistenciaZona3_4h:", this.resistenciaZona3_4h);
      console.log("resistenciaZona4_4h:", this.resistenciaZona4_4h);
      console.log(">");*/

      return data;
    };
  }

  ema8_ema26_rsi = async (interval, buySell) => {
    const {
      r2: r2_4h,
      r1: r1_4h,
      pp: pp_4h,
      s1: s1_4h,
      s2: s2_4h,
      resistenciaActual,
      soporteActual,
      isZona1,
      isZona2,
      isZona3,
      isZona4,
      resistenciaZona1,
      resistenciaZona2,
      resistenciaZona3,
      resistenciaZona4,
    } = this.SR_4h;

    /* console.log(
        "Prueba de datos: ",
        "resistenciaActual",
        resistenciaActual,
        "soporteActual",
        soporteActual,
        isZona1,
        isZona2,
        isZona3,
        isZona4,
        r2_4h,
        r1_4h,
        pp_4h,
        s1_4h,
        s2_4h
      );*/

    try {
      const idNameFuncion = `ema8_ema26_rsi${interval}`;
      if (buySell === "buy") {
        if (!isZona4) {
          const ultimaVela = this.ultimaVela(interval);

          if (this.hasCruceAlcista(idNameFuncion)) {
            if (
              this.is_RSI_Alcista(interval) &&
              this.EMA_RSI8_1h > 50 &&
              this.EMA_RSI8_1h <= 65
            ) {
              if (
                this.isUltimaVelaVerde(ultimaVela) &&
                parseFloat(ultimaVela.close) > this.EMA20_15m.at(-1)
              ) {
                const data = await this.compra(idNameFuncion);
                if (data) {
                  return data;
                }
              }
            }
          }
        }
        //console.log("IF #1 superado");
        /*if (this.hasCruceAlcista(idNameFuncion)) {
            console.log(
              `this.hasCruceAlcista("ema8-ema26-rsi")`,
              this.hasCruceAlcista(idNameFuncion)
            );
            console.log(`this.RSI14_15m.at(-1)`, this.RSI14_15m.at(-1));
            console.log(
              `this.is_RSI_Alcista(interval)`,
              this.is_RSI_Alcista(interval)
            );
          }*/
        /*  console.log(
                "IF #2 superado",
                this.RSI14_15m.at(-1) > 50 && this.is_RSI_Alcista(interval)
              );*/

        /*console.log("Ultima Vela: ", ultimaVela);
            console.log("this.EMA20_15m.at(-1): ", this.EMA20_15m.at(-1));

            console.log(
              "this.isUltimaVelaVerde(ultimaVela)",
              this.isUltimaVelaVerde(ultimaVela)
            );
            console.log(
              "Cerro por encima de la ema",
              parseFloat(ultimaVela.close) > this.EMA20_15m.at(-1)
            );*/
        /* console.log(
                  "Fecha: ",
                  convertToBerlinTime(this.ultimaVela("15m").closeTime)
                );*/

        // console.log("Datos de Compra", data);
      } else if (buySell === "sell") {
        const myOperacion = this.comprasArr.find(
          (operacion) => operacion.informacion.id === idNameFuncion
        );
        const { stopLoss, perdidaMaxima } = myOperacion.informacionMercado;

        if (this.price < stopLoss) {
          this.isStopLoss = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }
        if (this.price >= r2_4h) {
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }
        const ultimaVela = this.ultimaVela(interval);
        if (this.EMA_RSI8_15m < this.EMA_RSI26_15m) {
          /*  console.log("IF VENTA #1 ", this.EMA_RSI8_15m < this.EMA_RSI26_15m);
          console.log("EMA_RSI8_15m ", this.EMA_RSI8_15m);
          console.log("EMA_RSI26_15m", this.EMA_RSI26_15m);
          console.log(
            "this.RSI14_15m <= 55",
            this.RSI14_15m.at(-1),
            this.RSI14_15m.at(-1) <= 55
          );
          console.log("es bajista?", !this.is_RSI_Alcista(interval));*/

          /** En este caso buscar que !this.is_RSI_Alcista sea false es valido porque
           * la funcion solo toma en cuenta los dos ultimos valores ya que el rsi es muy volatil
           * por lo tanto si no es alcista significa que es bajista */

          if (this.RSI14_15m.at(-1) <= 55 && !this.is_RSI_Alcista(interval)) {
            // console.log("Ultima Vela: ", ultimaVela);
            // console.log("this.EMA20_15m", this.EMA20_15m.at(-1));

            /* console.log(
              "La vela es Verde? => tiene que ser false",
              !this.isUltimaVelaVerde(ultimaVela)
            );*/

            if (
              !this.isUltimaVelaVerde(ultimaVela) &&
              parseFloat(ultimaVela.close) < this.EMA20_15m.at(-1)
            ) {
              const data = await this.vende(idNameFuncion);
              if (data) {
                return data;
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error estrategia EMA_RSI 15m: ", error.message);
    }
  };
  //Prueba 1h
  ema8_ema26_rsi1h = async (interval, buySell) => {
    const {
      r2: r2_4h,
      r1: r1_4h,
      pp: pp_4h,
      s1: s1_4h,
      s2: s2_4h,
      resistenciaActual,
      soporteActual,
      isZona1,
      isZona2,
      isZona3,
      isZona4,
      resistenciaZona1,
      resistenciaZona2,
      resistenciaZona3,
      resistenciaZona4,
    } = this.SR_4h;

    /* console.log(
        "Prueba de datos: ",
        "resistenciaActual",
        resistenciaActual,
        "soporteActual",
        soporteActual,
        isZona1,
        isZona2,
        isZona3,
        isZona4,
        r2_4h,
        r1_4h,
        pp_4h,
        s1_4h,
        s2_4h
      );*/

    try {
      /* if (!this.RSI14_1h || this.RSI14_1h.length === 0) {
        throw new Error("RSI14_1h no está definido o está vacío.");
      }

      if (!this.EMA20_1h || this.EMA20_1h.length === 0) {
        throw new Error("EMA20_1h no está definido o está vacío.");
      }*/
      // console.log("RSI14_1h: ", this.RSI14_1h);
      // console.log("EMA20_1h: ", this.EMA20_1h);

      const idNameFuncion = `ema8_ema26_rsi${interval}`;

      if (buySell === "buy") {
        if (!this.isZona3_4h && !this.isZona4_4h && resistenciaActual) {
          if (this.ultimaVela("1h").openTime === 1730788200000) {
            /* console.log("indicadores:", "INDICADORES COMPRA");
            console.log(convertToBerlinTime(this.ultimaVela("1h").closeTime));
            console.log("Última Vela 1h:");
            console.log("UltimaVela:", this.ultimaVela("1h"));

            console.log("precio", this.price);

            console.log("EMA y RSI en 1h:");
            console.log("EMA20_1h:", this.EMA20_1h.at(-1));
            console.log("EMA_RSI8_1h:", this.EMA_RSI8_1h);
            console.log("EMA_RSI26_1h:", this.EMA_RSI26_1h);
            console.log("RSI14_1h:", this.RSI14_1h.at(-1));

            console.log("RSI Alcista en 1h:");
            console.log("is_RSI_Alcista:", this.is_RSI_Alcista("1h"));
            console.log(
              "hasCruceAlcista:",
              this.hasCruceAlcista(idNameFuncion)
            );*/
            // Log para soportes y resistencias de 1h
            /*  console.log("1H Soportes y Resistencias:");
            console.log(
              "sopRes1h:",
              "Compra Soportes y resistencias en velas de 1h"
            );
            console.log("r2_1h:", this.r2_1h);
            console.log("r1_1h:", this.r1_1h);
            console.log("pp_1h:", this.pp_1h);
            console.log("s1_1h:", this.s1_1h);
            console.log("s2_1h:", this.s2_1h);

            console.log("Resistencia y Soporte Actual 1H:");
            console.log("resistenciaActual_1h:", this.resistenciaActual_1h);
            console.log("soporteActual_1h:", this.soporteActual_1h);

            console.log("Zonas de Soportes y Resistencias 1H:");
            console.log("isZona1_1h:", this.isZona1_1h);
            console.log("isZona2_1h:", this.isZona2_1h);
            console.log("isZona3_1h:", this.isZona3_1h);
            console.log("isZona4_1h:", this.isZona4_1h);

            console.log("Resistencias por Zonas 1H:");
            console.log("resistenciaZona1_1h:", this.resistenciaZona1_1h);
            console.log("resistenciaZona2_1h:", this.resistenciaZona2_1h);
            console.log("resistenciaZona3_1h:", this.resistenciaZona3_1h);
            console.log("resistenciaZona4_1h:", this.resistenciaZona4_1h);

            // Log para soportes y resistencias de 4h
            console.log("4H Soportes y Resistencias:");
            console.log(
              "sopRes4h:",
              "cOMPRA Soportes y resistencias en velas de 4h"
            );
            console.log("r2_4h:", this.r2_4h);
            console.log("r1_4h:", this.r1_4h);
            console.log("pp_4h:", this.pp_4h);
            console.log("s1_4h:", this.s1_4h);
            console.log("s2_4h:", this.s2_4h);

            console.log("Resistencia y Soporte Actual 4H:");
            console.log("resistenciaActual_4h:", this.resistenciaActual_4h);
            console.log("soporteActual_4h:", this.soporteActual_4h);*/
            /* console.log("Zonas de Soportes y Resistencias 4H:");
            console.log("isZona1_4h:", this.isZona1_4h);
            console.log("isZona2_4h:", this.isZona2_4h);
            console.log("isZona3_4h:", this.isZona3_4h);
            console.log("isZona4_4h:", this.isZona4_4h);*/
            /* console.log("Resistencias por Zonas 4H:");
            console.log("resistenciaZona1_4h:", this.resistenciaZona1_4h);
            console.log("resistenciaZona2_4h:", this.resistenciaZona2_4h);
            console.log("resistenciaZona3_4h:", this.resistenciaZona3_4h);
            console.log("resistenciaZona4_4h:", this.resistenciaZona4_4h);
            console.log(">");*/
          }
          // console.log("DATA DE RETORNO DE LA COMPRA: ", data);

          // Log para indicadores de venta en 1h

          const ultimaVela = this.ultimaVela(interval);

          if (this.hasCruceAlcista(idNameFuncion)) {
            // console.log("is_RSI_Alcista:", this.is_RSI_Alcista("1h"));
            if (
              this.is_RSI_Alcista(interval) &&
              this.EMA_RSI8_1h >= 50 &&
              this.EMA_RSI8_1h <= 65
            ) {
              if (
                this.isUltimaVelaVerde(ultimaVela) &&
                parseFloat(ultimaVela.close) > this.EMA20_1h.at(-1)
              ) {
                const data = await this.compra(idNameFuncion);
                if (data) {
                  return data;
                }
              }
            }
          }
        }
        //console.log("IF #1 superado");
        /*if (this.hasCruceAlcista(idNameFuncion)) {
            console.log(
              `this.hasCruceAlcista("ema8-ema26-rsi")`,
              this.hasCruceAlcista(idNameFuncion)
            );
            console.log(`this.RSI14_15m.at(-1)`, this.RSI14_15m.at(-1));
            console.log(
              `this.is_RSI_Alcista(interval)`,
              this.is_RSI_Alcista(interval)
            );
          }*/
        /*  console.log(
                "IF #2 superado",
                this.RSI14_15m.at(-1) > 50 && this.is_RSI_Alcista(interval)
              );*/

        /*console.log("Ultima Vela: ", ultimaVela);
            console.log("this.EMA20_15m.at(-1): ", this.EMA20_15m.at(-1));

            console.log(
              "this.isUltimaVelaVerde(ultimaVela)",
              this.isUltimaVelaVerde(ultimaVela)
            );
            console.log(
              "Cerro por encima de la ema",
              parseFloat(ultimaVela.close) > this.EMA20_15m.at(-1)
            );*/
        /* console.log(
                  "Fecha: ",
                  convertToBerlinTime(this.ultimaVela("15m").closeTime)
                );*/

        // console.log("Datos de Compra", data);
      } else if (buySell === "sell") {
        /*  const myOperacion = this.comprasArr.find(
          (operacion) => operacion.informacion.id === idNameFuncion
        );*/
        /* console.log(
          "Esto devuelvo en : this.encontrarOrden(idNameFuncion)",
          this.encontrarOrden(idNameFuncion)
        );
*/
        const myOperacion = this.encontrarOrden(idNameFuncion);
        const {
          precioCompra,
          stopLoss,
          r2_1h,
          r1_1h,
          pp_1h,
          s1_1h,
          s2_1h,

          resistenciaActual_1h,
          soporteActual_1h,

          isZona1_1h,
          isZona2_1h,
          isZona3_1h,
          isZona4_1h,

          resistenciaZona1_1h,
          resistenciaZona2_1h,
          resistenciaZona3_1h,
          resistenciaZona4_1h,

          r2_4h,
          r1_4h,
          pp_4h,
          s1_4h,
          s2_4h,

          resistenciaActual_4h,
          soporteActual_4h,

          isZona1_4h,
          isZona2_4h,
          isZona3_4h,
          isZona4_4h,

          resistenciaZona1_4h,
          resistenciaZona2_4h,
          resistenciaZona3_4h,
          resistenciaZona4_4h,
        } = myOperacion.metricas; // momento de la compra

        if (this.price < stopLoss) {
          this.isStopLoss = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }

        /* if (this.RSI14_1h.at(-1) >= 75 || this.price >= resistenciaActual_1h) {
          if (this.RSI14_1h.at(-1) >= 75) {
            this.ventaRsi75 = true;
          } else if (this.price >= resistenciaActual_1h) {
            this.resistenciaActualAlcanzada = true;
          }
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }*/

        /* if (this.price >= resistenciaZona4_4h) {
          this.ventaResistenciaZona3 = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }
        if (this.price >= this.r2_4h) {
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }*/
        const ultimaVela = this.ultimaVela(interval);
        if (
          this.EMA_RSI8_1h < this.EMA_RSI26_1h &&
          !this.is_RSI_Alcista(interval)
        ) {
          if (
            !this.isUltimaVelaVerde(ultimaVela) &&
            parseFloat(ultimaVela.close) < this.EMA20_1h.at(-1)
          ) {
            const data = await this.vende(idNameFuncion);
            if (data) {
              return data;
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
  /* if (endTime - startTime > UN_ANO_MS) {
    throw new Error(
      "El rango de tiempo no puede exceder un año. Ajusta las fechas."
    );
  }*/
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
        // console.log("Alcanzada la fecha final.");
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
let symbol = "BTCUSDT";

let llamadasVelas15m = 0;

const backtesting = async (fechaStartBacktesting, fechaEndBacktesting) => {
  const startBacktesting = fechaStartBacktesting; //new Date("2024-11-01T00:00:00.000Z").getTime();
  const endBacktesting = fechaEndBacktesting; // new Date().getTime();
  console.log(
    "startBacktesting",
    startBacktesting,
    "=",
    convertToBerlinTime(startBacktesting)
  );
  console.log(
    "endBacktesting",
    endBacktesting,
    "=",
    convertToBerlinTime(endBacktesting)
  );

  const banckData15m = await getVelasData(
    symbol,
    "15m",
    startBacktesting,
    endBacktesting
  );
  console.log("Total de velas banckData15m: ", banckData15m.length);

  const banckData1h = await getVelasData(
    symbol,
    "1h",
    startBacktesting,
    endBacktesting
  );
  console.log("Total de velas banckData1h: ", banckData1h.length);

  const banckData4h = await getVelasData(
    symbol,
    "4h",
    startBacktesting,
    endBacktesting
  );
  console.log("Total de velas banckData4h: ", banckData4h.length);

  let actualizarArrData = 960;

  let data15mArr = banckData15m.slice(0, actualizarArrData); //obtengo las primeras 960 velas
  /* console.log(
    "ULTIMA VELA 96: ",
    data15mArr.slice(-1)[0],
    "HORA DE CIERRE = ",
    data15mArr.slice(-1)[0].closeTime,
    new Date(data15mArr.slice(-1)[0].closeTime),
    "Tengo esta cantidad de velas: ",
    data15mArr.length
  );*/

  const buscarVela1h = (ultimosDatos15m) => {
    const horaCierre1h = ultimosDatos15m.slice(-1)[0].closeTime;
    // console.log("horaCierre1h", horaCierre1h);

    const vela1h = banckData1h.find(
      (vela) => vela.openTime <= horaCierre1h && vela.closeTime >= horaCierre1h
    );
    // console.log("vela1h", vela1h);
    if (!vela1h) {
      console.error(
        "Error: No se encontró una vela de 4 horas que coincida con la hora de cierre de la vela de 15 minutos."
      );
      throw new Error("Error al buscar la vela de 4 horas.");
    }

    const indiceVela = banckData1h.findIndex(
      (vela) => vela.close === vela1h.close
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

  let data1hArr = banckData1h.slice(0, buscarVela1h(data15mArr) + 1);
  // console.log("data1hArr", data1hArr);

  /* console.log(
    "ULTIMA VELA 1h: ",
    data1hArr.slice(-1)[0],
    "HORA DE CIERRE = ",
    data1hArr.slice(-1)[0].closeTime,
    new Date(data1hArr.slice(-1)[0].closeTime),
    "Tengo esta cantidad de velas: ",
    data1hArr.length
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
      const priceCloseArr_1h = data1hArr.map((item) => parseFloat(item.close));
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

      const myData1h = obtenerIndicadores(
        data1hArr,
        "1h",
        priceActual,
        priceCloseArr_1h
      );
      const myData4h = obtenerIndicadores(
        data4hArr,
        "4h",
        priceActual,
        priceCloseArr_4h
      );

      myData.ultimosIndicadores.velas15m.push(myData15[0].indicadores);
      myData.ultimosIndicadores.velas1h.push(myData1h[0].indicadores);
      myData.ultimosIndicadores.velas4h.push(myData4h[0].indicadores);

      if (myData.ultimosIndicadores.velas15m.length > 10) {
        myData.ultimosIndicadores.velas15m =
          myData.ultimosIndicadores.velas15m.slice(-10);
      }
      if (myData.ultimosIndicadores.velas1h.length > 10) {
        myData.ultimosIndicadores.velas1h =
          myData.ultimosIndicadores.velas1h.slice(-10);
      }
      if (myData.ultimosIndicadores.velas4h.length > 10) {
        myData.ultimosIndicadores.velas4h =
          myData.ultimosIndicadores.velas4h.slice(-10);
      }
      // console.log("myData15", myData15);
      // console.log("myData4h", myData4h);

      const estrategias = new Estrategias(
        myData15,
        myData1h,
        myData4h,
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
        const buy = await estrategias.ema8_ema26_rsi1h("1h", "buy");

        if (buy) {
          //  console.log("HE COMPRADO");
          //  console.log("Datos de la compra: ", buy);

          //  console.log(buy);
          myData.compras.push(buy);
        }
      } else {
        //   console.log("NO ENCONTRE UNA COMPRA");
      }

      // Busca Venta
      if (myData.compras.length >= 1) {
        //console.log("BUSCANDO VENTA, MI LISTA ES DE: ", myData.compras.length);

        for (let i = 0; i < myData.compras.length; i++) {
          //    console.log("ESTOY DENTRO DE FOR DE LA LISTA DE COMPRAS");
          if (myData.compras[i].informacion.id === "ema8_ema26_rsi1h") {
            //    console.log("ENCONTRE UN ID LLAMADO EMA-RSI-15M");

            const sell = await estrategias.ema8_ema26_rsi1h("1h", "sell");

            if (sell) {
              // console.log("sell FUE EXITOSA: ", sell);

              if (sell.informacion.status === "finalizado") {
                // ELIMINO
                const ventaId = sell.compra.binanceOrdenData.orderId;
                const nuevoArr = myData.compras.filter(
                  (item) => item.binanceOrdenData.orderId !== ventaId
                );
                myData.compras = nuevoArr;
                /* console.log(
                  "ESTO TIENE EL ARR DE COMPRAS DESPUES DE ELIMINAR LA OPERACION",
                  myData.compras
                );*/

                console.log("Resultado: ", sell.resultado);
                console.log(">>>>>>>>>>");
                console.log(">>>>>>>>>>");
                console.log(">>>>>>>>>>");

                myData.historial.push(sell);
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

      if (llamadasVelas15m === 4) {
        data1hArr = banckData1h.slice(
          Math.max(0, buscarVela1h(data15mArr) - 239),
          buscarVela1h(data15mArr) + 1
        );
      }

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

      if (data15mArr.slice(-1)[0].closeTime >= endBacktesting) {
        console.log("Arr recorrido completo");
        break;
      }
    } catch (error) {
      console.log("Error en Backtesting", error.message);
      break;
    }
  }
  const historial = myData.historial;

  // Totales de operaciones ganadoras y perdedoras
  const totalGanadoras = historial.filter(
    (operacion) => operacion.resultado.isGanancia === true
  ).length;
  // Ganancia total y pérdida total
  const gananciaTotal = parseFloat(
    historial
      .filter((operacion) => operacion.resultado.isGanancia === true)
      .map((operacion) => operacion.resultado.usdt - 20)
      .reduce((a, b) => a + b, 0)
      .toFixed(2)
  );
  // Promedios de ganancia y pérdida
  const gananciaPromedio = parseFloat(
    (gananciaTotal / totalGanadoras || 0).toFixed(2)
  );

  const totalPerdedoras = historial.filter(
    (operacion) => operacion.resultado.isGanancia === false
  ).length;

  const perdidaTotal = parseFloat(
    Math.abs(
      historial
        .filter((operacion) => operacion.resultado.isGanancia === false)
        .map((operacion) => operacion.resultado.usdt - 20)
        .reduce((a, b) => a + b, 0)
    ).toFixed(2)
  );

  const perdidaPromedio = parseFloat(
    (perdidaTotal / totalPerdedoras || 0).toFixed(2)
  );

  //total stoploss
  const totalStopLoss = historial.filter(
    (operacion) => operacion.resultado.isStopLoss === true
  ).length;

  // Fórmulas de rendimiento
  const winRate = parseFloat(
    ((totalGanadoras / historial.length) * 100 || 0).toFixed(2)
  );
  const winLossRatio = parseFloat(
    (totalGanadoras / totalPerdedoras || 0).toFixed(2)
  );
  const profitFactor = parseFloat(
    (gananciaTotal / perdidaTotal || 0).toFixed(2)
  );

  // Expected Value (EV)
  const probabilidadGanar = parseFloat(
    (totalGanadoras / historial.length || 0).toFixed(2)
  );
  const probabilidadPerder = parseFloat(
    (totalPerdedoras / historial.length || 0).toFixed(2)
  );
  const expectedValue = parseFloat(
    (
      probabilidadGanar * gananciaPromedio -
        probabilidadPerder * perdidaPromedio || 0
    ).toFixed(2)
  );

  // Drawdown (máxima caída)
  let maxDrawdown = 0;
  let peak = 0;
  historial.reduce((equity, operacion) => {
    const nuevoEquity =
      equity +
      (operacion.resultado.isGanancia
        ? operacion.resultado.usdt - 20
        : -(20 - operacion.resultado.usdt));
    peak = Math.max(peak, nuevoEquity);
    const drawdown = peak - nuevoEquity;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    return nuevoEquity;
  }, 0);
  maxDrawdown = parseFloat(maxDrawdown.toFixed(2));

  // Datos de resumen
  const data = {
    fechaInicio: new Date(fechaStartBacktesting),
    fechaFinal: new Date(fechaEndBacktesting),
    resumenOperaciones: {
      totalAbiertas: historial.length,
      promedioMes: historial.length / 12,
      totalGanadoras,
      totalPerdedoras,
      totalStopLoss,
      gananciaTotal,
      gananciaPromedio,
      probabilidadGanar,
      perdidaTotal,
      perdidaPromedio,
      probabilidadPerder,
      rendimiento: {
        winRate,
        winLossRatio,
        profitFactor,
        expectedValue,
        maxDrawdown,
      },
    },
    // resultadoHistorial: historial.map((operacion) => operacion.resultado),
  };

  return data;
};

(async () => {
  const resultado = await backtesting(
    new Date("2023-01-01T00:00:00.000Z").getTime(),
    new Date("2024-12-31T00:00:00.000Z").getTime()
  );
  console.log(resultado);
})();

/*    new Date("2024-10-24T00:00:00.000Z").getTime(),
    new Date("2024-11-06T00:00:00.000Z").getTime()
     */
