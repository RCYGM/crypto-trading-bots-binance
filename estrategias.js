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
    data1m,
    data5m,
    data15m,
    data30m,
    data4h,
    data1d,
    data1w,
    price,
    comprasArr
  ) {
    this.data1m = data1m;
    this.data5m = data5m;
    this.data15m = data15m;
    this.data30m = data30m;
    this.data4h = data4h;
    this.data1d = data1d;
    this.data1w = data1w;
    this.price = price;
    this.comprasArr = comprasArr;
    this.indicadores1m = this.data1m[0].indicadores;
    this.indicadores5m = this.data5m[0].indicadores;
    this.indicadores15m = this.data15m[0].indicadores;
    this.indicadores30m = this.data30m[0].indicadores;
    this.indicadores4h = this.data4h[0].indicadores;
    this.indicadores1d = this.data1d[0].indicadores;
    this.indicadores1w = this.data1w[0].indicadores;
  }

  emarsi = async (tiempo, buySell) => {
    try {
      const {
        EMA10_5m,
        EMA50_5m,
        RSI14_5m,
        SR_5m,
        SMA_RSI_5m,
        ultimasVelasData_5m,
      } = this.indicadores5m;

      const {
        EMA10_15m,
        EMA50_15m,
        RSI14_15m,
        SR_15m,
        SMA_RSI_15m,
        ultimasVelasData_15m,
      } = this.indicadores15m;
      /*
      console.log(
        "Informacion Velas 15m",
        EMA10_15m,
        EMA50_15m,
        RSI14_15m,
        SR_15m,
        SMA_RSI_15m,
        ultimasVelasData_15m
      );*/
      const {
        EMA10_4h,
        EMA50_4h,
        RSI14_4h,
        SR_4h,
        SMA_RSI_4h,
        ultimasVelasData_4h,
      } = this.indicadores4h;

      const isAlcista = (ema10, ema50) => {
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error("Las EMAs necesitan al menos dos valores.");
        }
        return ema10.at(-1) > ema50.at(-1) && ema10.at(-2) < ema50.at(-2);
      };
      const isBajista = (ema10, ema50) => {
        if (ema10.length < 2 || ema50.length < 2) {
          throw new Error("Las EMAs necesitan al menos dos valores.");
        }
        return ema10.at(-1) < ema50.at(-1) && ema10.at(-2) > ema50.at(-2);
      };

      // console.log("Esto es lo que quiero ver", this.data5m, this.data15m, this.data4h, this.price);
      // console.log("4h", SR_4h, "15m", SR_15m, "5m", SR_5m);

      if (buySell === "sell") {
        // const price = await client.prices().then(prices => prices.BTCUSDT)
        console.log("ESTOY EVALUANDO CONDICIONES DE VENTA");
        const myOperacion = this.comprasArr.find(
          (operacion) => operacion.operacionData.id === "EMA-RSI-15M"
        );
        const { stopLoss, puedoLiquidarMitad } = myOperacion.estrategiaSalida;
        console.log("Esta es la Orden que Voy a procesar: ", myOperacion);

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
        const prueba = false;
        if (
          (this.price > myOperacion.estrategiaSalida.resistenciaZona3 &&
            puedoLiquidarMitad) ||
          (RSI14_15m.at(-1) > 60 && puedoLiquidarMitad) ||
          prueba
        ) {
          myOperacion.estrategiaSalida.puedoLiquidarMitad = false;
          // liquida el 50% y actualiza el objeto para que no liquide el otro 50% en la siguiente vuelta

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

        if (!myOperacion.estrategiaSalida.puedoLiquidarMitad) {
          console.log("Segundo IF superado");
          if (
            (RSI14_15m.at(-1) > 70 && SMA_RSI_15m < RSI14_15m.at(-1)) ||
            isBajista(EMA10_15m, EMA50_15m) ||
            prueba
          ) {
            // liquida el 100%
            /*try {
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

            const orden = {
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
            };

            myOperacion.operacionData.status = "finalizado";

            const data = {
              venta: {
                candLesticksVenta: {
                  data5m: this.data5m,
                  data15m: this.data15m,
                  data4h: this.data4h,
                },
                binanceOrdenData: orden,
              },
              compra: myOperacion,
            };
            console.log("Tercer IF superado");
            return data;
          }
        }
      }

      if (buySell === "buy") {
        if (tiempo === "15m") {
          // BUSCAMOS LONG EN MARCOS 15M
          console.log(
            "Objeto soporte Resistencia: ",
            SR_4h,
            "Ultimas Velas 15m",
            ultimasVelasData_15m
          );
          const prueba = false;
          if (
            (SR_4h.isZona1 &&
              EMA10_4h.at(-1) > EMA50_4h.at(-1) &&
              RSI14_4h.at(-1) > 40 &&
              RSI14_4h.at(-1) < 60) ||
            prueba
          ) {
            console.log("Precio en la zona1");

            console.log(
              "EMA10_4h > EMA50_4h && RSI14_4h > 40 && RSI14_4h < 60"
            );
            if (
              (isAlcista(EMA10_15m, EMA50_15m) &&
                RSI14_15m.at(-1) > 40 &&
                RSI14_15m.at(-1) < 50 &&
                ultimasVelasData_15m.hasVolumen) ||
              prueba
            ) {
              console.log(
                "EMA10_15m > EMA50_15m && RSI14_15m > 40 && RSI14_15m < 50"
              );
              const totalUSDT = 100; //await balances.balance("USDT");

              const perdidaMaxima = totalUSDT * 0.02;
              const stopLoss =
                SR_4h.soporteActual - (SR_4h.soporteActual * 1) / 100;
              const distanciaStopLoss = this.price - stopLoss;
              const compra = perdidaMaxima / distanciaStopLoss;

              console.log(
                "stopLoss",
                stopLoss,
                "perdida Maxima",
                perdidaMaxima,
                "distanciaStopLoss",
                distanciaStopLoss,
                "Tamaño de la Posicion",
                compra,
                "compra en USDT",
                compra * this.price
              );

              if (compra) {
                /*try {
                    const orden = await client.order({
                      symbol: "BTCUSDT",
                      side: "BUY",
                      type: "MARKET",
                      quantity: compra,
                    });
                  } catch (error) {
                    console.log("Error al realizar la compra", error.message);
                  }*/
                const orden = {
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
                };

                if (orden) {
                  const data = {
                    operacionData: {
                      id: "EMA-RSI-15M",
                      status: "curso",
                    },
                    estrategiaSalida: {
                      stopLoss: stopLoss,
                      puedoLiquidarMitad: true,
                      perdidaMaxima: perdidaMaxima,
                      resistenciaZona1:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona1,
                      resistenciaZona2:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona2,
                      resistenciaZona3:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona3,
                      resistenciaZona4:
                        SR_4h.soporteActual + SR_4h.valorZonas.valorZona4,
                      SR_4h: SR_4h,
                    },
                    candLesticksCompra: {
                      data5m: this.data5m,
                      data15m: this.data15m,
                      data4h: this.data4h,
                    },
                    binanceOrdenData: orden,
                  };
                  return data;
                }
              }
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
