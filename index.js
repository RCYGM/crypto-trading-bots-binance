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

const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

const Balances = require("./balances");
const balances = new Balances();

const CandLesticksData = require("./candLesticksData");
const candLesticksData = new CandLesticksData();

const Estrategias = require("./estrategias");

// Probar conexión a Binance

let hasCompra = false;

const myData = {
  candLesticksData: [],
  compras: [],
  ventas: [],
  historial: [],
};

const fetchHistoricalData = async () => {
  try {
    // Solicitar datos de velas (klines)
    const priceBTCUSDT = await client.prices().then((prices) => prices.BTCUSDT);
    const data1m = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "1m",
      60,
      priceBTCUSDT
    ); // 1 minuto

    const data5m = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "5m",
      60,
      priceBTCUSDT
    ); // 5 minutos

    const data15m = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "15m",
      60,
      priceBTCUSDT
    ); // 15 minutos

    const data30m = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "30m",
      60,
      priceBTCUSDT
    ); // 30 minutos

    const data4h = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "4h",
      60,
      priceBTCUSDT
    ); // 4 horas

    const data1d = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "1d",
      60,
      priceBTCUSDT
    ); // 1 día

    const data1w = await candLesticksData.getcandLesticksDataData(
      "BTCUSDT",
      "1w",
      60,
      priceBTCUSDT
    ); // 1 semana

    const estrategias = new Estrategias(
      data1m,
      data5m,
      data15m,
      data30m,
      data4h,
      data1d,
      data1w,
      priceBTCUSDT,
      myData.compras
    );
    console.log("Datos de las velas empaquetados");

    // Busca compra
    if (myData.compras.length < 1) {
      console.log("Estoy Buscando una estrategia");

      const BUY_EMARSI_15M = await estrategias.emarsi("15m", "buy");

      if (BUY_EMARSI_15M) {
        console.log(">>>>> COMPRE  EN BUY_EMARSI_15M");
        myData.compras.push(BUY_EMARSI_15M);
        console.log(
          ">>>>> LO ENVIE A LA LISTA DE COMPRAS Y ESTO ES LO QUE TIENE LA LISTA: ",
          myData.compras
        );
      } else {
        console.log(">>>>> NO ENCONTRE OPORTUNIDAD");
      }
    }

    // Busca Venta
    if (myData.compras.length >= 1) {
      console.log(
        "Tengo una lista de compra pendiente de: ",
        myData.compras.length
      );

      for (let i = 0; i < myData.compras.length; i++) {
        console.log(
          "Voy a analizar la estrategia de cada una de las compras para ver si cumple con la estrategia de salida"
        );

        if (myData.compras[i].operacionData.id === "EMA-RSI-15M") {
          console.log(
            "Estoy Analizando la compra con la estrategia id >EMA-RSI-15M<"
          );

          const SELL_EMARSI_15 = await estrategias.emarsi("15m", "sell");

          if (SELL_EMARSI_15) {
            console.log(
              "La estrategia con id >EMA-RSI-15M se cumplio con EXITO<"
            );

            if (SELL_EMARSI_15.compra.operacionData.status === "finalizado") {
              // ELIMINO
              const ventaId = SELL_EMARSI_15.compra.binanceOrdenData.orderId;
              const nuevoArr = myData.compras.filter(
                (item) => item.binanceOrdenData.orderId !== ventaId
              );
              myData.compras = nuevoArr;
              myData.historial.push(SELL_EMARSI_15);
              console.log("Lista de compra pendiente: ", myData.compras.length);
              console.log("Historial de operaciones: ", myData.historial);
            }
          } else {
            console.log(">>>>> NO HUBO VENTA");
          }
        }
      }
    }

    myData.buscandoEstrategia = {
      data5m: data5m[0],
      data15m: data15m[0],
      data4h: data4h[0],
    };
    /*
    console.log(
      "estrategiaData",
      myData.compras[0].estrategiaData,
      "candLesticksCompra",
      myData.compras[0].estrategiaData.candLesticksCompra
    );*/
  } catch (error) {
    console.log("Error al obtener datos históricos:", error.message);
  }
};

setInterval(() => {
  fetchHistoricalData();
}, 3000);
