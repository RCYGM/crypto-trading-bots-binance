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

  getData = async (symbol, interval, limit) => {
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
      const velas = await client.candles({
        symbol: symbol,
        interval: interval,
        limit: limit,
        //startTime: undefined,
        //endTine: undefined,
      });

      if (velas) {
        const priceHighArr = velas.map((item) => parseFloat(item.high));
        const priceLowArr = velas.map((item) => parseFloat(item.low));
        const priceCloseArr = velas.map((item) => parseFloat(item.close));

        const ema10 = indicadores.calculateEMA(priceCloseArr, 10);
        const ema50 = indicadores.calculateEMA(priceCloseArr, 50);
        const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);
        const sopResObj = indicadores.calculateSopRes(
          priceHighArr,
          priceLowArr,
          priceCloseArr
        );
        const ultimasVelas = velas.slice(-3);

        const data = [
          {
            candLesticksInterval: interval,
            candLesticks: velas,
            indicadores: {
              [`EMA10_${interval}`]: ema10,
              [`EMA50_${interval}`]: ema50,
              [`RSI14_${interval}`]: rsi14,
              [`ULTIMASVELAS_${interval}`]: ultimasVelas,
              [`SP_${interval}`]: sopResObj,
            },
          },
        ];

        return data;
      }
    } catch (error) {
      console.log("Error al obtener CandLesticksData:", error.message);
    }
  };
}

module.exports = CandLesticksData;
