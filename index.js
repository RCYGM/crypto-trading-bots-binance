const Binance = require("binance-api-node").default;

// Cargar credenciales desde el archivo .env
require("dotenv").config();
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  useServerTime: true, // Activa la sincronización con el servidor de Binance
});
const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

const Balances = require("./balances");
const balances = new Balances();

const CandLesticksData = require("./candLesticksData");
const candLesticksData = new CandLesticksData();

const Estrategias = require("./estrategias");

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

let hasCompra = false;

const myData = {
  buscandoEstrategia: [],
  compras: [],
  ventas: [],
};

const fetchHistoricalData = async () => {
  try {
    // Solicitar datos de velas (klines)
    const data5m = await candLesticksData.getData("BTCUSDT", "5m", 60); // 5 minutos
    const data15m = await candLesticksData.getData("BTCUSDT", "15m", 60); // 15 minutos
    const data30m = await candLesticksData.getData("BTCUSDT", "30m", 60); // 30 minutos
    const data4h = await candLesticksData.getData("BTCUSDT", "4h", 60); // 4 horas
    const data1d = await candLesticksData.getData("BTCUSDT", "1d", 60); // 1 día
    const data1w = await candLesticksData.getData("BTCUSDT", "1w", 60); // 1 semana
    const priceBTCUSDT = await client.prices().then((prices) => prices.BTCUSDT);

    const estrategias = new Estrategias(
      data5m,
      data15m,
      data30m,
      data4h,
      data1d,
      data1w,
      priceBTCUSDT
    );

    const GET_EMARSI15m = await estrategias.EMA_RSI("15m");

    if (GET_EMARSI15m) {
      myData.compras.push(GET_EMARSI15m);
      console.log("Compra Realizada en EMARSI15m: ", myData.compras[0]);
    } else {
      console.log("NO HAY ENTRADA EN EMARSI15m");
    }

    myData.buscandoEstrategia = {
      data5m: data5m[0],
      data15m: data15m[0],
      data4h: data4h[0],
    };
  } catch (error) {
    console.log("Error al obtener datos históricos:", error.message);
  }
};

if (!hasCompra) {
  fetchHistoricalData();
} else if (hasCompra) {
  console.log("Aplicar Enfoque en venta");
}
