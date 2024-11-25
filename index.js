const Binance = require("binance-api-node").default;
const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

// Cargar credenciales desde el archivo .env
require("dotenv").config();
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

const estrategia_EMARSI = (data5m, data15m, data4h, price) => {
  const { ema10_5m, ema50_5m, rsi14_5m, sopResObj_5m } = data5m;
  const { ema10_15m, ema50_15m, rsi14_15m, sopResObj_15m } = data15m;
  const { ema10_4h, ema50_4h, rsi14_4h, sopResObj_4h } = data4h;

  const is4hAlcista = (getis4hAlcista = () => {
    if (ema10_4h > ema50_4h && rsi14_4h > 50 && sopResObj_4h.pp / 4) {
      return true;
    } else {
      return false;
    }
  });

  if (is4hAlcista) {
    console.log("Estoy Dentro");
  }

  console.log(data5m, data15m, data4h);
};

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

const candlesticksData = [
  {
    symbol: "BTCUSD",
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
    getEstrategias: [estrategia_EMARSI],
    candLesticks: [
      {
        symbolName: "BTCUSDT-5M",
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

const fetchHistoricalData = async () => {
  const getCandlesticks_5m = candlesticksData[0].getCandlesticksData[0];
  const getCandlesticks_15m = candlesticksData[0].getCandlesticksData[0];
  const getCandlesticks_4h = candlesticksData[0].getCandlesticksData[0];

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

    estrategia_EMARSI(data5m, data15m, data4h, priceBTCUSDT);

    candlesticksData[0].candLesticks[0].candLesticks = candLesticks_5m;
    candlesticksData[0].candLesticks[1].candLesticks = candLesticks_15m;
    candlesticksData[0].candLesticks[2].candLesticks = candLesticks_4h;
  } catch (error) {
    console.log("Error al obtener datos históricos:", error.message);
  }
};
fetchHistoricalData();
