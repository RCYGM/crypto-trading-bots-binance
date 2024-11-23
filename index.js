const Binance = require("binance-api-node").default;

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
let candlesticksArr_BTCUSDT = [];

const fetchHistoricalData = async () => {
  try {
    // Parámetros para la solicitud
    const symbol = symbolArr[0];
    const interval = intervalArr[1];
    const limit = limitArr[0];
    const startTime = startTimeArr[0];
    const endTine = endTineArr[0];

    // Solicitar datos de velas (klines)
    const candLesticks = await client.candles({
      symbol: symbol,
      interval: interval,
      limit: limit,
    });
    candlesticksArr_BTCUSDT = candLesticks;
  } catch (error) {
    console.log("Error al obtener datos históricos:", error.message);
  }
};
// fetchHistoricalData();
