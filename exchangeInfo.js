const Binance = require("binance-api-node").default;
require("dotenv").config();

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  useServerTime: true,
});

async function obtenerExchangeInfo() {
  try {
    const time = await client.time();
    console.log(
      "Hora del servidor de Binance:",
      new Date(time).toLocaleString()
    );

    const exchangeInfo = await client.exchangeInfo();
    const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === "BTCUSDT");

    console.log(symbolInfo.filters);
  } catch (error) {
    console.error("Error al conectar con Binance:", error.message);
  }
}

// Ejecutar la función
obtenerExchangeInfo();
