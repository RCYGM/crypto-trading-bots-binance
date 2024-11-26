const Binance = require("binance-api-node").default;
const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

// Cargar credenciales desde el archivo .env
require("dotenv").config();
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  useServerTime: true, // Activa la sincronización con el servidor de Binance
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

const candlesticksData = [
  {
    symbol: "BTCUSD",
    ordenesArr: [],
    getCandlesticksData: [
      {
        symbol: "BTCUSDT",
        interval: "5m",
        limit: 60,
        //startTime: undefined,
        //endTine: undefined,
      },
      {
        symbol: "BTCUSDT",
        interval: "15m",
        limit: 60,
        //startTime: undefined,
        // endTine: undefined,
      },
      {
        symbol: "BTCUSDT",
        interval: "4h",
        limit: 60,
        //startTime: undefined,
        //endTine: undefined,
      },
    ],
    candLesticks: [
      {
        symbolName: "BTCUSDT-5M",
        indicadores: {},
        highArr: [],
        lowArr: [],
        closeArr: [],
        volumeArr: [],
        quoteVolumeArr: [],
        tradesArr: [],
        baseAssetVolumeArr: [],
        quoteAssetVolumeArr: [],
        candLesticks: [],
      },
      {
        symbolName: "BTCUSDT-15M",
        indicadores: {},
        highArr: [],
        lowArr: [],
        closeArr: [],
        volumeArr: [],
        quoteVolumeArr: [],
        tradesArr: [],
        baseAssetVolumeArr: [],
        quoteAssetVolumeArr: [],
        candLesticks: [],
      },
      {
        symbolName: "BTCUSDT-4H",
        indicadores: {},
        highArr: [],
        lowArr: [],
        closeArr: [],
        volumeArr: [],
        quoteVolumeArr: [],
        tradesArr: [],
        baseAssetVolumeArr: [],
        quoteAssetVolumeArr: [],
        candLesticks: [],
      },
    ],
  },
];

let hasCompra = false;

const gestionEMARSI_15m = async () => {
  const precioActual = await client.prices().then((prices) => prices.BTCUSDT);
  const { ema10_15m, ema50_15m, rsi14_15, sopResObj_15m } =
    candlesticksData[0].candLesticks[1].indicadores;

  // const stopLoss =
};

const gestionRiesgo = [gestionEMARSI_15m];

const estrategia_EMARSI = (data5m, data15m, data4h, price) => {
  const { ema10_5m, ema50_5m, rsi14_5m, sopResObj_5m } = data5m;
  const { ema10_15m, ema50_15m, rsi14_15m, sopResObj_15m } = data15m;
  const { ema10_4h, ema50_4h, rsi14_4h, sopResObj_4h } = data4h;

  const candLesticks_5m =
    candlesticksData[0].candLesticks[0].candLesticks.slice(-3);
  const candLesticks_15m =
    candlesticksData[0].candLesticks[1].candLesticks.slice(-3);
  const candLesticks_4h =
    candlesticksData[0].candLesticks[2].candLesticks.slice(-3);

  console.log(data5m, data15m, data4h, price);

  if (!hasCompra) {
    // Precio se encuentra cerca de un soporte identificado en el marco de 4 horas.
    const isCercaSoporte =
      price < sopResObj_4h.s1 + sopResObj_4h.s1 * 1.35 &&
      price > sopResObj_4h.s1
        ? true
        : price < sopResObj_4h.s2 + sopResObj_4h.s2 * 1.35 &&
          price > sopResObj_4h.s2
        ? true
        : false;

    // EMA 10 está por encima de EMA 50, indicando una tendencia alcista general.
    const isSeñalAlcista = ema10_4h.at(-1) > ema50_4h.at(-1);

    // RSI en el marco mayor esta entre 40 y 60 (no en sobrecompra ni sobreventa).
    const isRsiObtimo = rsi14_4h.at(-1) < 60 && rsi14_4h.at(-1) > 40;

    // Confirmación en el Marco de 15 Minutos o 5 Minutos (Marco Menor)
    if (isCercaSoporte && isSeñalAlcista && isRsiObtimo) {
      // EMA 10 cruza hacia arriba EMA 50 en el marco menor Y RSI entre 40 y 50 en el momento del cruce.
      const señalEntrada =
        ema10_15m.at(-1) > ema50_15m.at(-1) &&
        ema10_15m.at(-2) < ema50_15m.at(-2) &&
        rsi14_15m.at(-1) > 40 &&
        rsi14_15m.at(-1) < 60;

      const confirmacionVolumen =
        candLesticks_15m[0].volume < candLesticks_15m[1].volume &&
        candLesticks_15m[1].volume < candLesticks_15m[3].volume;

      if (señalEntrada && confirmacionVolumen) {
        const cantidad = 20 / price;
        client
          .order({
            symbol: "BTCUSDT",
            side: "BUY",
            type: "MARKET", // Tipos: LIMIT, MARKET, STOP_LOSS, etc.
            quantity: cantidad,
          })
          .then((order) => {
            console.log("Orden creada:", order);
          })
          .catch((error) => {
            console.log("Error al crear la orden:", error.message);
          });

        hasCompra = true;
      }

      console.log("");
    }
  }
};

const fetchHistoricalData = async () => {
  const getCandlesticks_5m = candlesticksData[0].getCandlesticksData[0];
  const getCandlesticks_15m = candlesticksData[0].getCandlesticksData[1];
  const getCandlesticks_4h = candlesticksData[0].getCandlesticksData[2];

  try {
    // Solicitar datos de velas (klines)
    const candLesticks_5m = await client.candles(getCandlesticks_5m);
    const candLesticks_15m = await client.candles(getCandlesticks_15m);
    const candLesticks_4h = await client.candles(getCandlesticks_4h);

    let data5m = {};
    let data15m = {};
    let data4h = {};

    if (candLesticks_5m) {
      const priceHighArr_5m = (candlesticksData[0].candLesticks[0].highArr =
        candLesticks_5m.map((item) => parseFloat(item.high)));
      const priceLowArr_5m = (candlesticksData[0].candLesticks[0].lowArr =
        candLesticks_5m.map((item) => parseFloat(item.low)));
      const priceCloseArr_5m = (candlesticksData[0].candLesticks[0].closeArr =
        candLesticks_5m.map((item) => parseFloat(item.close)));

      const ema10_5m = indicadores.calculateEMA(priceCloseArr_5m, 10);
      const ema50_5m = indicadores.calculateEMA(priceCloseArr_5m, 50);
      const rsi14_5m = indicadores.calculateRSI(priceCloseArr_5m, 14);
      const sopResObj = indicadores.calculateSopRes(
        priceHighArr_5m,
        priceLowArr_5m,
        priceCloseArr_5m
      );

      data5m = { candLesticks: "5m", ema10_5m, ema50_5m, rsi14_5m, sopResObj };
    }
    if (candLesticks_15m) {
      const priceHighArr_15m = (candlesticksData[0].candLesticks[1].highArr =
        candLesticks_15m.map((item) => parseFloat(item.high)));
      const priceLowArr_15m = (candlesticksData[0].candLesticks[1].lowArr =
        candLesticks_15m.map((item) => parseFloat(item.low)));
      const priceCloseArr_15m = (candlesticksData[0].candLesticks[1].closeArr =
        candLesticks_15m.map((item) => parseFloat(item.close)));

      const ema10_15m = indicadores.calculateEMA(priceCloseArr_15m, 10);
      const ema50_15m = indicadores.calculateEMA(priceCloseArr_15m, 50);
      const rsi14_15 = indicadores.calculateRSI(priceCloseArr_15m, 14);
      const sopResObj_15m = indicadores.calculateSopRes(
        priceHighArr_15m,
        priceLowArr_15m,
        priceCloseArr_15m
      );

      data15m = {
        candLesticks: "15m",
        ema10_15m,
        ema50_15m,
        rsi14_15,
        sopResObj_15m,
      };
    }
    if (candLesticks_4h) {
      const priceHighArr_4h = (candlesticksData[0].candLesticks[2].highArr =
        candLesticks_4h.map((item) => parseFloat(item.high)));
      const priceLowArr_4h = (candlesticksData[0].candLesticks[2].lowArr =
        candLesticks_4h.map((item) => parseFloat(item.low)));
      const priceCloseArr_4h = (candlesticksData[0].candLesticks[2].closeArr =
        candLesticks_4h.map((item) => parseFloat(item.close)));

      const ema10_4h = indicadores.calculateEMA(priceCloseArr_4h, 10);
      const ema50_4h = indicadores.calculateEMA(priceCloseArr_4h, 50);
      const rsi14_4h = indicadores.calculateRSI(priceCloseArr_4h, 14);
      const sopResObj_4h = indicadores.calculateSopRes(
        priceHighArr_4h,
        priceLowArr_4h,
        priceCloseArr_4h
      );

      data4h = {
        candLesticks: "4h",
        ema10_4h,
        ema50_4h,
        rsi14_4h,
        sopResObj_4h,
      };
    }
    const priceBTCUSDT = await client.prices().then((prices) => prices.BTCUSDT);
    const myOrdenesBTCUSDT = await client
      .openOrders({ symbol: "BTCUSDT" })
      .then((orders) => {
        console.log("Órdenes abiertas para BTCUSDT:", orders);
      });

    candlesticksData[0].ordenesArr = myOrdenesBTCUSDT;
    candlesticksData[0].candLesticks[0].candLesticks = candLesticks_5m;
    candlesticksData[0].candLesticks[1].candLesticks = candLesticks_15m;
    candlesticksData[0].candLesticks[2].candLesticks = candLesticks_4h;

    candlesticksData[0].candLesticks[0].indicadores = data5m;
    candlesticksData[0].candLesticks[1].indicadores = data15m;
    candlesticksData[0].candLesticks[2].indicadores = data4h;

    estrategia_EMARSI(data5m, data15m, data4h, priceBTCUSDT);
  } catch (error) {
    console.log("Error al obtener datos históricos:", error.message);
  }
};

if (!hasCompra) {
  fetchHistoricalData();
} else if (hasCompra) {
  console.log("Aplicar Enfoque en venta");
}
