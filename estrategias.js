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
  }

  emarsi = async (tiempo) => {
    try {
      const indicadores5m = this.data5m[0].indicadores;
      const indicadores15m = this.data15m[0].indicadores;
      const indicadores4h = this.data4h[0].indicadores;

      const { EMA10_5m, EMA50_5m, RSI14_5m, SP_5m, ULTIMASVELAS_5m } =
        indicadores5m;

      const { EMA10_15m, EMA50_15m, RSI14_15m, SP_15m, ULTIMASVELAS_15m } =
        indicadores15m;

      const { EMA10_4h, EMA50_4h, RSI14_4h, SP_4h, ULTIMASVELAS_4h } =
        indicadores4h;

      // console.log("Esto es lo que quiero ver", this.data5m, this.data15m, this.data4h, this.price);
      // console.log("4h", SP_4h, "15m", SP_15m, "5m", SP_5m);

      if (this.comprasArr.length >= 1) {
        console.log("Tengo una venta en cola");
        console.log(this.comprasArr.length);
        console.log(this.comprasArr);
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

        const data = {
          venta: {
            candLesticksVenta: {
              data5m: this.data5m,
              data15m: this.data15m,
              data4h: this.data4h,
            },
            binanceDataVenta: {
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

      if (this.comprasArr.length < 1) {
        if (tiempo === "15m") {
          /*
          // Precio se encuentra cerca de un soporte identificado en el marco de 4 horas.
  
          const isCercaSoporte_s1s2 =
            this.price < SP_4h.s1 + SP_4h.s1 * 1.35 && this.price > SP_4h.s1
              ? true
              : this.price < SP_4h.s2 + SP_4h.s2 * 1.35 && this.price > SP_4h.s2
              ? true
              : false;
  
          // EMA 10 está por encima de EMA 50, indicando una tendencia alcista general.
  
          const isSeñalAlcista = EMA10_4h.at(-1) > EMA50_4h.at(-1);
  
          // RSI en el marco mayor esta entre 40 y 60 (no en sobrecompra ni sobreventa).
          const isRsiObtimo = RSI14_4h.at(-1) < 60 && RSI14_4h.at(-1) > 40;
  
          */

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
              const stopLoss = SP_4h.s1 - SP_4h.s1 * 0.02;
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
                estrategiaSalida: {
                  id: "EMA-RSI-15M",
                  estrategiaSalida: {
                    r1_4h: SP_4h.r1,
                    pp_4h: SP_4h.pp,
                    stopLoss: stopLoss,
                    perdidaMaxima: perdidaMaxima,
                  },
                },
                candLesticksCompra: {
                  data5m: this.data5m,
                  data15m: this.data15m,
                  data4h: this.data4h,
                },
                binanceDataCompra: {
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
