const Binance = require("binance-api-node").default;
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

const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

class CandLesticksData {
  constructor() {}

  getcandLesticksDataData = async (
    symbol,
    interval,
    limit,
    price,
    startTime,
    endTime
  ) => {
    if (symbol === String) {
      throw new Error("Debes proporcionar un String en el primer parametro");
    }
    if (symbol === String) {
      throw new Error("Debes proporcionar un String en el segundo parametro");
    }
    if (symbol === Number) {
      throw new Error("Debes proporcionar un Number en el tercer parametro");
    }

    try {
      let velas = undefined;
      if (startTime && endTime) {
        const getVelas = await client.candles({
          symbol: symbol,
          interval: interval,
          limit: limit,
          startTime: startTime,
          endTine: endTime,
        });
        velas = getVelas;
      } else if (startTime && !endTime) {
        const getVelas = await client.candles({
          symbol: symbol,
          interval: interval,
          limit: limit,
          startTime: startTime,
        });
        velas = getVelas;
      } else {
        const getVelas = await client.candles({
          symbol: symbol,
          interval: interval,
          limit: limit,
        });
        velas = getVelas;
      }

      if (velas) {
        // console.log("Velas Obtenidas con Exito");

        //const priceHighArr = velas.map((item) => parseFloat(item.high));
        //const priceLowArr = velas.map((item) => parseFloat(item.low));
        const priceCloseArr = velas.map((item) => parseFloat(item.close));

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

        // console.log("Datos de las Velas Empaquetados y enviados");

        return data;
      }
    } catch (error) {
      console.log("Error al obtener CandLesticksData:", error.message);
    }
  };
  /*
  getBacktesting15m(velas4h, velas15m, velas5m) {
    // Procesa cada conjunto de velas
    const procesarVelas = (velas, interval) => {
      const priceCloseArr = velas.map((item) => parseFloat(item.close));

      const ema10 = indicadores.calculateEMA(priceCloseArr, 10);
      const ema50 = indicadores.calculateEMA(priceCloseArr, 50);
      const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);
      const smaRsi = indicadores.calculateSMA_RSI(rsi14, 14);
      const sopResObj = indicadores.calculateSopRes(priceCloseArr, price);
      const getHasVolumen = indicadores.calculateHasVolumen(velas.slice(-5));

      return {
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
              getHasVolumen.hasVolumen3velas || getHasVolumen.hasVolumen5velas,
            hasVolumen3Velas: getHasVolumen.hasVolumen3velas,
            hasVolumen5Velas: getHasVolumen.hasVolumen5velas,
          },
          [`SR_${interval}`]: sopResObj,
        },
      };
    };

    // Procesar las velas para cada intervalo
    const data4h = procesarVelas(velas4h, "4h");
    const data15m = procesarVelas(velas15m, "15m");
    const data5m = procesarVelas(velas5m, "5m");

    return {
      data4h,
      data15m,
      data5m,
    };
  }*/
}

module.exports = CandLesticksData;
