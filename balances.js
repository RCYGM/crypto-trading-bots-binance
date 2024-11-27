const Binance = require("binance-api-node").default;
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

class Balances {
  constructor() {}

  balance = async (moneda) => {
    try {
      const balance = await client.accountInfo().then((info) => {
        const balanceObj = info.balances.find(
          (balance) => balance.asset === moneda
        );
        const balanceFree = parseFloat(balanceObj.free);
        return balanceFree;
      });
      return balance;
    } catch (error) {
      console.log("Error al obtener Balance USDT:", error.message);
    }
  };
}

module.exports = Balances;
