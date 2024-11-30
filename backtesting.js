const CandLesticksData = require("./candLesticksData");
const candLesticksData = CandLesticksData();
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

const buscarVelaData = async (
  symbol,
  interval,
  limit,
  price,
  startTime,
  endTime
) => {
  const velaData = await candLesticksData.getcandLesticksDataData(
    symbol,
    interval,
    limit,
    price,
    startTime,
    endTime
  );
  return velaData;
};

class Backtesting {
  constructor(/*symbol, interval, limit, price, startTime, endTime*/) {
    /*this.symbol = symbol;
    this.interval = interval;
    this.limit = limit;
    this.price = price;
    this.startTime = startTime;
    this.endTime = endTime;*/

    // Métricas de Rendimiento
    // Métricas de Rendimiento
    this.gananciaTotal = 0; // Total de ganancias en todas las operaciones: ganancia acumulada de operaciones ganadoras.
    this.perdidaTotal = 0; // Total de pérdidas en todas las operaciones: pérdida acumulada de operaciones perdedoras.
    this.roi = 0; // Retorno sobre la inversión: (capitalFinal - capitalInicial) / capitalInicial * 100.
    this.hitRate = 0; // Tasa de acierto: (operacionesGanadoras / totalOperaciones) * 100.
    this.gananciaPromedio = 0; // Ganancia promedio por operación ganadora: gananciaTotal / operacionesGanadoras.
    this.perdidaPromedio = 0; // Pérdida promedio por operación perdedora: perdidaTotal / operacionesPerdedoras.

    // Estadísticas de Operaciones
    this.totalOperaciones = 0; // Total de operaciones realizadas: operacionesGanadoras + operacionesPerdedoras.
    this.operacionesGanadoras = 0; // Número de operaciones con ganancia: operaciones cuyo resultado fue positivo.
    this.operacionesPerdedoras = 0; // Número de operaciones con pérdida: operaciones cuyo resultado fue negativo.
    this.mayorGanancia = 0; // Mayor ganancia en una operación: máximo valor en las operaciones ganadoras.
    this.mayorPerdida = 0; // Mayor pérdida en una operación: máximo valor en las operaciones perdedoras (en negativo).

    // Drawdown
    this.capitalMaximo = 0; // Capital máximo alcanzado durante el backtesting.
    this.capitalMinimo = 0; // Capital mínimo alcanzado durante el backtesting.
    this.drawdownMaximo = 0; // Máxima pérdida relativa desde el capital máximo: (capitalMaximo - capitalMinimo) / capitalMaximo * 100.

    // Análisis Temporal
    this.duracionPromedioOperaciones = 0; // Duración promedio de operaciones: tiempoTotalOperaciones / totalOperaciones.
    this.tiempoTotalOperaciones = 0; // Tiempo total acumulado de operaciones: suma de (tiempo de cierre - tiempo de apertura) para todas las operaciones.
    this.frecuenciaOperaciones = 0; // Promedio de operaciones por unidad de tiempo: totalOperaciones / periodoTotalBacktesting.

    // Validación de la Estrategia
    this.condicionesEntradaCumplidas = 0; // Número de veces que se cumplieron las condiciones de entrada.
    this.condicionesSalidaCumplidas = 0; // Número de veces que se cumplieron las condiciones de salida.
    this.stopLossActivados = 0; // Número de veces que el stop-loss fue activado: operaciones cerradas por stop-loss.

    // Almacén de Operaciones
    this.historialOperaciones = []; // Array para almacenar los detalles de cada operación: incluye precios, tiempos, ganancias/pérdidas, etc.
  }

  emarsi15m(symbol, startTime, endTime) {
    const data5m = buscarVelaData(
      symbol,
      interval,
      60,
      false,
      startTime,
      endTime
    );
    console.log(data5m);
    return true;

    // for (let i = 0; i < candlestickData.length; i++) {

    //}
  }
}

const backtesting = Backtesting();
const fechaActual = new Date(); // Fecha actual
const fechaInicial = new Date(
  fechaActual.getFullYear(),
  fechaActual.getMonth() - 6,
  fechaActual.getDate()
).getTime();

const verprueba = backtesting.emarsi15m("BTCUSDT", fechaInicial, fechaActual);

//console.log("Fecha actual:", fechaActual.getTime()); // En milisegundos
//console.log("Fecha inicial (hace 6 meses):", fechaInicial); // En milisegundos
