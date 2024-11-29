const CandLesticksData = require("./candLesticksData");

const Binance = require("binance-api-node").default;

// Cargar credenciales desde el archivo .env
require("dotenv").config();
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  useServerTime: true, // Activa la sincronización con el servidor de Binance
});

class Estrategias {
  constructor(
    data5m,
    data15m,
    data30m,
    data4h,
    data1d,
    data1w,
    price,
    comprasArr
  ) {
    this.data5m = data5m;
    this.data15m = data15m;
    this.data30m = data30m;
    this.data4h = data4h;
    this.data1d = data1d;
    this.data1w = data1w;
    this.price = price;
    this.comprasArr = comprasArr;
    this.indicadores5m = this.data5m[0].indicadores;
    this.indicadores15m = this.data15m[0].indicadores;
    this.indicadores30m = this.data30m[0].indicadores;
    this.indicadores4h = this.data4h[0].indicadores;
    this.indicadores1d = this.data1d[0].indicadores;
    this.indicadores1w = this.data1w[0].indicadores;
  }

  emarsi = async (tiempo, buySell) => {
    try {
      const { EMA10_15m, EMA50_15m, RSI14_15m, SR_15m, ULTIMASVELAS_15m } =
        this.indicadores15m;

      const { EMA10_4h, EMA50_4h, RSI14_4h, SR_4h, ULTIMASVELAS_4h } =
        this.indicadores4h;

      // console.log("Esto es lo que quiero ver", this.data5m, this.data15m, this.data4h, this.price);
      // console.log("4h", SR_4h, "15m", SR_15m, "5m", SR_5m);

      if (buySell === "sell") {
        // const price = await client.prices().then(prices => prices.BTCUSDT)
        console.log("ESTOY EVALUANDO CONDICIONES DE VENTA");
        const { stopLoss, perdidaMaxima } =
          this.comprasArr[0].estrategiaData.estrategiaSalida;

        if (this.price <= stopLoss) {
          /*
          try {
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
        }

        const tendenciaBajista_15m = true; //EMA10_15m < EMA50_15m;

        if (tendenciaBajista_15m) {
        }

        console.log("SOPORTE Y RESISTENCIA AQUI>>>>>>>>>>>>>.. ", SR_4h);

        console.log(
          "Stop Loss",
          stopLoss,
          "Perdida Maxima",
          perdidaMaxima,
          "Ultimas Velas 15m",
          ULTIMASVELAS_15m
        );

        const data = {
          venta: {
            candLesticksVenta: {
              data5m: this.data5m,
              data15m: this.data15m,
              data4h: this.data4h,
            },
            binanceOrdenData: {
              symbol: "BTC-VENDIDO",
              orderId: 100000000,
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
                  price: "50000.00",
                  qty: "0.001",
                  commission: "0.00000005",
                  commissionAsset: "BTC",
                  tradeId: 987654321,
                },
              ],
            },
          },
          compra: this.comprasArr[0],
        };
        return data;
      }

      if (buySell === "buy") {
        if (tiempo === "15m") {
          // BUSCAMOS LONG EN MARCOS 15M
          if (EMA10_4h > EMA50_4h) {
            // const soporteValido =
          }
          // Confirmación en el Marco de 15 Minutos o 5 Minutos (Marco Menor)
          const isCercaSoporte_s1s2 = true;
          const isSeñalAlcista = true;
          const isRsiObtimo = true;

          if (isCercaSoporte_s1s2 && isSeñalAlcista && isRsiObtimo) {
            // EMA 10 cruza hacia arriba EMA 50 en el marco menor Y RSI entre 40 y 50 en el momento del cruce.

            /*
            const señalEntrada =
              EMA10_15m.at(-1) > EMA50_15m.at(-1) &&
              EMA10_15m.at(-2) < EMA50_15m.at(-2) &&
              RSI14_15m.at(-1) > 40 &&
              RSI14_15m.at(-1) < 60;
  
            const confirmacionVolumen =
              ULTIMASVELAS_15m[0].volume < ULTIMASVELAS_15m[1].volume &&
              ULTIMASVELAS_15m[1].volume < ULTIMASVELAS_15m[3].volume;
  */
            const señalEntrada = true;
            const confirmacionVolumen = true;

            if (señalEntrada && confirmacionVolumen) {
              const totalUSDT = 100; //await balances.balance("USDT");

              const perdidaMaxima = totalUSDT * 0.02;
              const stopLoss = SR_4h.s1 - SR_4h.s1 * 0.02;
              const distanciaStopLoss = this.price - stopLoss;
              const compra = perdidaMaxima / distanciaStopLoss;

              /* console.log(
                "stopLoss",
                stopLoss,
                "perdida Maxima",
                perdidaMaxima,
                "distanciaStopLoss",
                distanciaStopLoss,
                "Tamaño de la Posicion",
                compra,
                "compra USDT",
                compra * this.price
              );*/

              /*
          try {
            const orden = await client.order({
              symbol: "BTCUSDT",
              side: "BUY",
              type: "MARKET",
              quantity: 0.001,
            });
          } catch (error) {
            console.log("Error al realizar la compra", error.message);
          }
  */
              const data = {
                estrategiaData: {
                  id: "EMA-RSI-15M",
                  estrategiaSalida: {
                    SR_4h: SR_4h,
                    stopLoss: stopLoss,
                    perdidaMaxima: perdidaMaxima,
                  },
                },
                candLesticksCompra: {
                  data5m: this.data5m,
                  data15m: this.data15m,
                  data4h: this.data4h,
                },
                binanceOrdenData: {
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
                      price: "50000.00",
                      qty: "0.001",
                      commission: "0.00000005",
                      commissionAsset: "BTC",
                      tradeId: 987654321,
                    },
                  ],
                },
              };

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
module.exports = Estrategias;
