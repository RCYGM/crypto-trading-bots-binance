const Binance = require("binance-api-node").default;
const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

// Cargar credenciales desde el archivo .env
require("dotenv").config();
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

// Probar conexión a Binance

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

// Obtener datos históricos
const symbolArr = ["BTCUSDT"];
const intervalArr = [
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1m",
];
const limitArr = [1000, 5];
const startTimeArr = [];
const endTineArr = [];

const candlesticksArr = [
  {
    symbolName: "BTCUSDT",
    candLesticks: [],
    closeCandLesticks: [],
    indicadores: [
      {
        nombre: "EMA",
      },
      {
        nombre: "RSI",
      },
    ],
    estrategias: [
      {
        nombre: "EMA-RSI",
      },
    ],
  },
];

const estrategia_EMARSI = (ema10, ema50, rsi, soporteResistencia) => {
  console.log(ema10, ema50, rsi, soporteResistencia);
};

const fetchHistoricalData = async () => {
  try {
    // Parámetros para la solicitud
    const symbol = symbolArr[0];
    const interval = intervalArr[1];
    const limit = 100; //limitArr[1];
    const startTime = startTimeArr[0];
    const endTine = endTineArr[0];

    // Solicitar datos de velas (klines)
    const candLesticks = await client.candles({
      symbol: symbol,
      interval: interval,
      limit: limit,
    });
    const preciosCierreArr = (candlesticksArr[0].closeCandLesticks =
      candLesticks.map((item) => parseFloat(item.close)));
    console.log(
      "Arreglo de precio de cierre variable actualizada",
      preciosCierreArr
    );

    const ema10 = indicadores.calculateEMA(preciosCierreArr, 10);
    const ema50 = indicadores.calculateEMA(preciosCierreArr, 50);
    const rsi14 = indicadores.calculateRSI(preciosCierreArr, 14);

    console.log("EMA 10", ema10);
    console.log("EMA 50", ema50);
    console.log("RSI 14", rsi14);

    estrategia_EMARSI(ema10, ema50, rsi14);
    candlesticksArr[0].candLesticks = candLesticks;
    /*
    console.log(
      "Arreglo de precio de cierre key actualizado",
      candlesticksArr[0].closeCandLesticks
    );
    console.log(
      "Arreglo de precio de cierre variable actualizada",
      preciosCierreArr
    );
    console.log("Estoy en el arreglo", candlesticksArr[0].candLesticks); */
  } catch (error) {
    console.log("Error al obtener datos históricos:", error.message);
  }
};
fetchHistoricalData();
