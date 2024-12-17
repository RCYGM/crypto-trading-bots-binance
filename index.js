// ================================================================================

// ================================================================================

// ================================================================================

const usdtOperacion = 20; // Es la cantidad en USDT que compraras al operar en BTC.
const temporalidad = "1h"; // Es el grafico en el que vas a operar, puede ser "15m"  "5m "  "1m"  siempre dentro de las "".
const evaluarCada = 1; // Es el tiempo en segundos que el bot tardara para volver a analizar la estrategia, tiene que ser en segundos.
const verGraficos = true; // Escribe true para ver los gráficos y false para dejar de verlos.

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

// ===== ⚠️ NO CAMBIES NADA A PARTIR DE AQUÍ SI NO SABES DE JAVASCRIPT ⚠️ =====

// ================================================================================

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

const symbol = "BTCUSDT";

const tiempoEvaluacion =
  evaluarCada * 1000 < 30000 ? 30000 : evaluarCada * 1000;
const idEstrategia = `ema8_ema26_rsi${temporalidad}`;
const myData = {
  candLesticksData: [],
  ultimosIndicadores: {
    velas1m: [],
    velas5m: [],
    velas15m: [],
    velas30m: [],
    velas1h: [],
    velas4h: [],
  },
  compras: [],
  ventas: [],
  historial: [],
};
const convertToBerlinTime = (utcTime) => {
  const date = new Date(utcTime); // UTC timestamp de Binance
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin", // Zona horaria UTC+1 Berlín
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return formatter.format(date);
};

const Indicadores = require("./indicadores");
const indicadores = new Indicadores();

class Estrategias {
  constructor(
    data1m,
    data5m,
    data15m,
    data30m,
    data1h,
    data4h,
    price,
    comprasArr,
    ultimosIndicadores
  ) {
    if (data1m.candLesticksInterval !== "1m") {
      throw new Error("Error en Estrategias data1m no es 1m");
    }
    if (data5m.candLesticksInterval !== "5m") {
      throw new Error("Error en Estrategias data5m no es 5m");
    }
    if (data15m.candLesticksInterval !== "15m") {
      throw new Error("Error en Estrategias data15m no es 15m");
    }
    if (data30m.candLesticksInterval !== "30m") {
      throw new Error("Error en Estrategias data30m no es 30m");
    }
    if (data1h.candLesticksInterval !== "1h") {
      throw new Error("Error en Estrategias data1h no es 1h");
    }
    if (data4h.candLesticksInterval !== "4h") {
      throw new Error("Error en Estrategias data4h no es 4h");
    }

    //Data General
    this.data1m = data1m;
    this.data5m = data5m;
    this.data15m = data15m;
    this.data30m = data30m;
    this.data1h = data1h;
    this.data4h = data4h;
    this.price = price;
    this.comprasArr = comprasArr;

    //Velas en el presente
    this.velas1m = this.data1m.candLesticks;
    this.velas5m = this.data5m.candLesticks;
    this.velas15m = this.data15m.candLesticks;
    this.velas30m = this.data30m.candLesticks;
    this.velas1h = this.data1h.candLesticks;
    this.velas4h = this.data4h.candLesticks;

    // Indicadores
    this.indicadores1m = this.data1m.indicadores;
    this.indicadores5m = this.data5m.indicadores;
    this.indicadores15m = this.data15m.indicadores;
    this.indicadores30m = this.data30m.indicadores;
    this.indicadores1h = this.data1h.indicadores;
    this.indicadores4h = this.data4h.indicadores;

    const {
      EMA10_1m,
      EMA20_1m,
      EMA50_1m,
      RSI14_1m,
      SR_1m,
      EMA8_RSI_1m,
      EMA26_RSI_1m,
      ultimasVelasData_1m,
    } = this.indicadores1m;

    const {
      r2: r2_1m,
      r1: r1_1m,
      pp: pp_1m,
      s1: s1_1m,
      s2: s2_1m,
      resistenciaActual: resistenciaActual_1m,
      soporteActual: soporteActual_1m,
      isZona1: isZona1_1m,
      isZona2: isZona2_1m,
      isZona3: isZona3_1m,
      isZona4: isZona4_1m,
      resistenciaZona1: resistenciaZona1_1m,
      resistenciaZona2: resistenciaZona2_1m,
      resistenciaZona3: resistenciaZona3_1m,
      resistenciaZona4: resistenciaZona4_1m,
    } = SR_1m;

    this.r2_1m = r2_1m;
    this.r1_1m = r1_1m;
    this.pp_1m = pp_1m;
    this.s1_1m = s1_1m;
    this.s2_1m = s2_1m;
    this.resistenciaActual_1m = resistenciaActual_1m;
    this.soporteActual_1m = soporteActual_1m;
    this.isZona1_1m = isZona1_1m;
    this.isZona2_1m = isZona2_1m;
    this.isZona3_1m = isZona3_1m;
    this.isZona4_1m = isZona4_1m;
    this.resistenciaZona1_1m = resistenciaZona1_1m;
    this.resistenciaZona2_1m = resistenciaZona2_1m;
    this.resistenciaZona3_1m = resistenciaZona3_1m;
    this.resistenciaZona4_1m = resistenciaZona4_1m;

    this.EMA10_1m = EMA10_1m; // Arr
    this.EMA20_1m = EMA20_1m; // Arr
    this.EMA50_1m = EMA50_1m; // Arr
    this.RSI14_1m = RSI14_1m; // Arr
    this.SR_1m = SR_1m; // Obj
    this.EMA8_RSI_1m = EMA8_RSI_1m; // Number
    this.EMA26_RSI_1m = EMA26_RSI_1m; // Number
    this.ultimasVelasData_1m = ultimasVelasData_1m; // Arr => Obj

    const {
      EMA10_5m,
      EMA20_5m,
      EMA50_5m,
      RSI14_5m,
      SR_5m,
      EMA8_RSI_5m,
      EMA26_RSI_5m,
      ultimasVelasData_5m,
    } = this.indicadores5m;

    const {
      r2: r2_5m,
      r1: r1_5m,
      pp: pp_5m,
      s1: s1_5m,
      s2: s2_5m,
      resistenciaActual: resistenciaActual_5m,
      soporteActual: soporteActual_5m,
      isZona1: isZona1_5m,
      isZona2: isZona2_5m,
      isZona3: isZona3_5m,
      isZona4: isZona4_5m,
      resistenciaZona1: resistenciaZona1_5m,
      resistenciaZona2: resistenciaZona2_5m,
      resistenciaZona3: resistenciaZona3_5m,
      resistenciaZona4: resistenciaZona4_5m,
    } = SR_5m;

    this.r2_5m = r2_5m;
    this.r1_5m = r1_5m;
    this.pp_5m = pp_5m;
    this.s1_5m = s1_5m;
    this.s2_5m = s2_5m;
    this.resistenciaActual_5m = resistenciaActual_5m;
    this.soporteActual_5m = soporteActual_5m;
    this.isZona1_5m = isZona1_5m;
    this.isZona2_5m = isZona2_5m;
    this.isZona3_5m = isZona3_5m;
    this.isZona4_5m = isZona4_5m;
    this.resistenciaZona1_5m = resistenciaZona1_5m;
    this.resistenciaZona2_5m = resistenciaZona2_5m;
    this.resistenciaZona3_5m = resistenciaZona3_5m;
    this.resistenciaZona4_5m = resistenciaZona4_5m;

    this.EMA10_5m = EMA10_5m; // Arr
    this.EMA20_5m = EMA20_5m; // Arr
    this.EMA50_5m = EMA50_5m; // Arr
    this.RSI14_5m = RSI14_5m; // Arr
    this.SR_5m = SR_5m; // Obj
    this.EMA8_RSI_5m = EMA8_RSI_5m; // Number
    this.EMA26_RSI_5m = EMA26_RSI_5m; // Number
    this.ultimasVelasData_5m = ultimasVelasData_5m; // Arr => Obj

    const {
      EMA10_15m,
      EMA20_15m,
      EMA50_15m,
      RSI14_15m,
      SR_15m,
      EMA8_RSI_15m,
      EMA26_RSI_15m,
      ultimasVelasData_15m,
    } = this.indicadores15m;

    const {
      r2: r2_15m,
      r1: r1_15m,
      pp: pp_15m,
      s1: s1_15m,
      s2: s2_15m,
      resistenciaActual: resistenciaActual_15m,
      soporteActual: soporteActual_15m,
      isZona1: isZona1_15m,
      isZona2: isZona2_15m,
      isZona3: isZona3_15m,
      isZona4: isZona4_15m,
      resistenciaZona1: resistenciaZona1_15m,
      resistenciaZona2: resistenciaZona2_15m,
      resistenciaZona3: resistenciaZona3_15m,
      resistenciaZona4: resistenciaZona4_15m,
    } = SR_15m;

    this.r2_15m = r2_15m;
    this.r1_15m = r1_15m;
    this.pp_15m = pp_15m;
    this.s1_15m = s1_15m;
    this.s2_15m = s2_15m;
    this.resistenciaActual_15m = resistenciaActual_15m;
    this.soporteActual_15m = soporteActual_15m;
    this.isZona1_15m = isZona1_15m;
    this.isZona2_15m = isZona2_15m;
    this.isZona3_15m = isZona3_15m;
    this.isZona4_15m = isZona4_15m;
    this.resistenciaZona1_15m = resistenciaZona1_15m;
    this.resistenciaZona2_15m = resistenciaZona2_15m;
    this.resistenciaZona3_15m = resistenciaZona3_15m;
    this.resistenciaZona4_15m = resistenciaZona4_15m;

    this.EMA10_15m = EMA10_15m; // Arr
    this.EMA20_15m = EMA20_15m; // Arr
    this.EMA50_15m = EMA50_15m; // Arr
    this.RSI14_15m = RSI14_15m; // Arr
    this.SR_15m = SR_15m; // Obj
    this.EMA8_RSI_15m = EMA8_RSI_15m; // Number
    this.EMA26_RSI_15m = EMA26_RSI_15m; // Number
    this.ultimasVelasData_15m = ultimasVelasData_15m; // Arr => Obj

    const {
      EMA10_30m,
      EMA20_30m,
      EMA50_30m,
      RSI14_30m,
      SR_30m,
      EMA8_RSI_30m,
      EMA26_RSI_30m,
      ultimasVelasData_30m,
    } = this.indicadores30m;

    const {
      r2: r2_30m,
      r1: r1_30m,
      pp: pp_30m,
      s1: s1_30m,
      s2: s2_30m,
      resistenciaActual: resistenciaActual_30m,
      soporteActual: soporteActual_30m,
      isZona1: isZona1_30m,
      isZona2: isZona2_30m,
      isZona3: isZona3_30m,
      isZona4: isZona4_30m,
      resistenciaZona1: resistenciaZona1_30m,
      resistenciaZona2: resistenciaZona2_30m,
      resistenciaZona3: resistenciaZona3_30m,
      resistenciaZona4: resistenciaZona4_30m,
    } = SR_30m;

    this.r2_30m = r2_30m;
    this.r1_30m = r1_30m;
    this.pp_30m = pp_30m;
    this.s1_30m = s1_30m;
    this.s2_30m = s2_30m;
    this.resistenciaActual_30m = resistenciaActual_30m;
    this.soporteActual_30m = soporteActual_30m;
    this.isZona1_30m = isZona1_30m;
    this.isZona2_30m = isZona2_30m;
    this.isZona3_30m = isZona3_30m;
    this.isZona4_30m = isZona4_30m;
    this.resistenciaZona1_30m = resistenciaZona1_30m;
    this.resistenciaZona2_30m = resistenciaZona2_30m;
    this.resistenciaZona3_30m = resistenciaZona3_30m;
    this.resistenciaZona4_30m = resistenciaZona4_30m;

    this.EMA10_30m = EMA10_30m; // Arr
    this.EMA20_30m = EMA20_30m; // Arr
    this.EMA50_30m = EMA50_30m; // Arr
    this.RSI14_30m = RSI14_30m; // Arr
    this.SR_30m = SR_30m; // Obj
    this.EMA8_RSI_30m = EMA8_RSI_30m; // Number
    this.EMA26_RSI_30m = EMA26_RSI_30m; // Number
    this.ultimasVelasData_30m = ultimasVelasData_30m; // Arr => Obj

    const {
      EMA10_1h,
      EMA20_1h,
      EMA50_1h,
      RSI14_1h,
      SR_1h,
      EMA8_RSI_1h,
      EMA26_RSI_1h,
      ultimasVelasData_1h,
    } = this.indicadores1h;

    const {
      r2: r2_1h,
      r1: r1_1h,
      pp: pp_1h,
      s1: s1_1h,
      s2: s2_1h,
      resistenciaActual: resistenciaActual_1h,
      soporteActual: soporteActual_1h,
      isZona1: isZona1_1h,
      isZona2: isZona2_1h,
      isZona3: isZona3_1h,
      isZona4: isZona4_1h,
      resistenciaZona1: resistenciaZona1_1h,
      resistenciaZona2: resistenciaZona2_1h,
      resistenciaZona3: resistenciaZona3_1h,
      resistenciaZona4: resistenciaZona4_1h,
    } = SR_1h;

    this.r2_1h = r2_1h;
    this.r1_1h = r1_1h;
    this.pp_1h = pp_1h;
    this.s1_1h = s1_1h;
    this.s2_1h = s2_1h;
    this.resistenciaActual_1h = resistenciaActual_1h;
    this.soporteActual_1h = soporteActual_1h;
    this.isZona1_1h = isZona1_1h;
    this.isZona2_1h = isZona2_1h;
    this.isZona3_1h = isZona3_1h;
    this.isZona4_1h = isZona4_1h;
    this.resistenciaZona1_1h = resistenciaZona1_1h;
    this.resistenciaZona2_1h = resistenciaZona2_1h;
    this.resistenciaZona3_1h = resistenciaZona3_1h;
    this.resistenciaZona4_1h = resistenciaZona4_1h;

    this.EMA10_1h = EMA10_1h; // Arr
    this.EMA20_1h = EMA20_1h; // Arr
    this.EMA50_1h = EMA50_1h; // Arr
    this.RSI14_1h = RSI14_1h; // Arr
    this.SR_1h = SR_1h; // Obj
    this.EMA8_RSI_1h = EMA8_RSI_1h; // Number
    this.EMA26_RSI_1h = EMA26_RSI_1h; // Number
    this.ultimasVelasData_1h = ultimasVelasData_1h; // Arr => Obj

    const {
      EMA10_4h,
      EMA20_4h,
      EMA50_4h,
      RSI14_4h,
      SR_4h,
      EMA8_RSI_4h,
      EMA26_RSI_4h,
      ultimasVelasData_4h,
    } = this.indicadores4h;

    const {
      r2: r2_4h,
      r1: r1_4h,
      pp: pp_4h,
      s1: s1_4h,
      s2: s2_4h,
      resistenciaActual: resistenciaActual_4h,
      soporteActual: soporteActual_4h,
      isZona1: isZona1_4h,
      isZona2: isZona2_4h,
      isZona3: isZona3_4h,
      isZona4: isZona4_4h,
      resistenciaZona1: resistenciaZona1_4h,
      resistenciaZona2: resistenciaZona2_4h,
      resistenciaZona3: resistenciaZona3_4h,
      resistenciaZona4: resistenciaZona4_4h,
    } = SR_4h;

    this.r2_4h = r2_4h;
    this.r1_4h = r1_4h;
    this.pp_4h = pp_4h;
    this.s1_4h = s1_4h;
    this.s2_4h = s2_4h;
    this.resistenciaActual_4h = resistenciaActual_4h;
    this.soporteActual_4h = soporteActual_4h;
    this.isZona1_4h = isZona1_4h;
    this.isZona2_4h = isZona2_4h;
    this.isZona3_4h = isZona3_4h;
    this.isZona4_4h = isZona4_4h;
    this.resistenciaZona1_4h = resistenciaZona1_4h;
    this.resistenciaZona2_4h = resistenciaZona2_4h;
    this.resistenciaZona3_4h = resistenciaZona3_4h;
    this.resistenciaZona4_4h = resistenciaZona4_4h;

    this.EMA10_4h = EMA10_4h; // Arr
    this.EMA20_4h = EMA20_4h; // Arr
    this.EMA50_4h = EMA50_4h; // Arr
    this.RSI14_4h = RSI14_4h; // Arr
    this.SR_4h = SR_4h; // Obj
    this.EMA8_RSI_4h = EMA8_RSI_4h; // Number
    this.EMA26_RSI_4h = EMA26_RSI_4h; // Number
    this.ultimasVelasData_4h = ultimasVelasData_4h; // Arr => Obj

    // Informacion del pasado
    this.ultimosIndicadores = ultimosIndicadores;

    // Metricas
    this.dineoDisponible = 100;
    this.isStopLoss = false;
    this.ventaResistenciaZona3 = false;
    this.ventaRsi75 = false;
    this.resistenciaActualAlcanzada = false;

    //Funciones constructoras
    this.hasCruceAlcista = (idNameFuncion) => {
      if (this.ultimosIndicadores.velas15m.length >= 5) {
        switch (idNameFuncion) {
          case "ema8_ema26_rsi1m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas1m.slice(-10)[0].EMA8_RSI_1m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas1m.slice(-5)[0].EMA8_RSI_1m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas1m.slice(-5)[0].EMA8_RSI_1m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas1m.slice(-1)[0].EMA8_RSI_1m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas1m.slice(-1)[0].EMA26_RSI_1m;
            const cruceTardido =
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 > rsiUltEma26 && rsiPenultimaEma8 < rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi5m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas5m.slice(-10)[0].EMA8_RSI_5m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas5m.slice(-5)[0].EMA8_RSI_5m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas5m.slice(-5)[0].EMA8_RSI_5m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas5m.slice(-1)[0].EMA8_RSI_5m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas5m.slice(-1)[0].EMA26_RSI_5m;
            const cruceTardido =
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 > rsiUltEma26 && rsiPenultimaEma8 < rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi15m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas15m.slice(-10)[0].EMA8_RSI_5m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas15m.slice(-5)[0].EMA8_RSI_5m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas15m.slice(-5)[0].EMA8_RSI_5m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA8_RSI_5m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA26_RSI_5m;
            const cruceTardido =
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 > rsiUltEma26 && rsiPenultimaEma8 < rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi30m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas30m.slice(-10)[0].EMA8_RSI_30m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas30m.slice(-5)[0].EMA8_RSI_30m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas30m.slice(-5)[0].EMA8_RSI_30m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas30m.slice(-1)[0].EMA8_RSI_30m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas30m.slice(-1)[0].EMA26_RSI_30m;
            const cruceTardido =
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 > rsiUltEma26 && rsiPenultimaEma8 < rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi1h": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas1h.slice(-10)[0].EMA8_RSI_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas1h.slice(-5)[0].EMA8_RSI_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas1h.slice(-5)[0].EMA8_RSI_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas1h.slice(-1)[0].EMA8_RSI_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas1h.slice(-1)[0].EMA26_RSI_1h;
            const cruceTardido =
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 > rsiUltEma26 && rsi5taEma8 < rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 > rsiUltEma26 && rsiPenultimaEma8 < rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false;
        }
      } else {
        return false;
      }
    };

    this.hasCruceBajista = (idNameFuncion) => {
      if (this.ultimosIndicadores.velas15m.length >= 5) {
        switch (idNameFuncion) {
          case "ema8_ema26_rsi1m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas1m.slice(-10)[0].EMA8_RSI_1m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas1m.slice(-5)[0].EMA8_RSI_1m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas1m.slice(-5)[0].EMA8_RSI_1m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas1m.slice(-1)[0].EMA8_RSI_1m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas1m.slice(-1)[0].EMA26_RSI_1m;
            const cruceTardido =
              rsiUltEma8 < rsiUltEma26 && rsi10maEma8 > rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 < rsiUltEma26 && rsiPenultimaEma8 > rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi5m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas5m.slice(-10)[0].EMA8_RSI_5m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas5m.slice(-5)[0].EMA8_RSI_5m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas5m.slice(-5)[0].EMA8_RSI_5m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas5m.slice(-1)[0].EMA8_RSI_5m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas5m.slice(-1)[0].EMA26_RSI_5m;
            const cruceTardido =
              rsiUltEma8 < rsiUltEma26 && rsi10maEma8 > rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 < rsiUltEma26 && rsiPenultimaEma8 > rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi15m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas15m.slice(-10)[0].EMA8_RSI_15m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas15m.slice(-5)[0].EMA8_RSI_15m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas15m.slice(-5)[0].EMA8_RSI_15m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA8_RSI_15m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA26_RSI_15m;
            const cruceTardido =
              rsiUltEma8 < rsiUltEma26 && rsi10maEma8 > rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 < rsiUltEma26 && rsiPenultimaEma8 > rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi30m": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas30m.slice(-10)[0].EMA8_RSI_30m;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas30m.slice(-5)[0].EMA8_RSI_30m;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas30m.slice(-5)[0].EMA8_RSI_30m;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas30m.slice(-1)[0].EMA8_RSI_30m;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas30m.slice(-1)[0].EMA26_RSI_30m;
            const cruceTardido =
              rsiUltEma8 < rsiUltEma26 && rsi10maEma8 > rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 < rsiUltEma26 && rsiPenultimaEma8 > rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          case "ema8_ema26_rsi1h": {
            const rsi10maEma8 =
              this.ultimosIndicadores.velas1h.slice(-10)[0].EMA8_RSI_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas1h.slice(-5)[0].EMA8_RSI_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas1h.slice(-5)[0].EMA8_RSI_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas1h.slice(-1)[0].EMA8_RSI_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas1h.slice(-1)[0].EMA26_RSI_1h;
            const cruceTardido =
              rsiUltEma8 < rsiUltEma26 && rsi10maEma8 > rsiUltEma26;
            const crucePrudente =
              rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
            const cruceReciente =
              rsiUltEma8 < rsiUltEma26 && rsiPenultimaEma8 > rsiUltEma26;

            return cruceReciente || crucePrudente || cruceTardido;
          }
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false;
        }
      } else {
        return false;
      }
    };

    this.is_RSI_Alcista = (intervalo) => {
      const velasKey = `velas${intervalo}`;
      const emaRsi8Key = `EMA8_RSI_${intervalo}`;

      if (this.ultimosIndicadores.velas15m.length >= 5) {
        const penultimoEmaRsi =
          this.ultimosIndicadores[velasKey].slice(-10)[0][emaRsi8Key];
        const ultimoEmaRsi =
          this.ultimosIndicadores[velasKey].slice(-1)[0][emaRsi8Key];

        return ultimoEmaRsi > penultimoEmaRsi;
      } else {
        return false;
      }
    };

    this.ultimaVela = (interval) => {
      const velasKey = `velas${interval}`;
      return this[velasKey].slice(-2)[0];
    };

    this.isVelaVerde = (ultimaVelaObj) => {
      return parseFloat(ultimaVelaObj.close) > parseFloat(ultimaVelaObj.open);
    };

    this.encontrarOrden = (idNameFuncion) => {
      const myOperacion = this.comprasArr.find(
        (operacion) => operacion.informacion.id === idNameFuncion
      );
      return myOperacion;
    };

    this.compra = async (idNameFuncion) => {
      try {
        const calcularDatosCompra = async () => {
          const ultimaVela = this.ultimaVela("15m");

          const inversionUsdt = usdtOperacion; //await balances.balance("USDT");
          const perdidaMaxima = inversionUsdt * 0.02;
          const stopLoss = parseFloat(
            (this.price - this.price * 0.01).toFixed(2)
          ); /*parseFloat(this.ultimaVela("1h").low);*/
          //console.log("Vela", this.ultimaVela("1h"), "stopLoss", stopLoss);

          const compra = parseFloat((inversionUsdt / this.price).toFixed(5));
          return {
            perdidaMaxima,
            stopLoss,
            btc: compra,
            usdt: compra * this.price,
            compra,
          };
        };
        const { perdidaMaxima, stopLoss, btc, usdt, compra } =
          await calcularDatosCompra();

        const orden = await client.order({
          symbol: "BTCUSDT",
          side: "BUY",
          type: "MARKET",
          quantity: compra,
        });

        if (orden) {
          const data = {
            informacion: {
              id: idNameFuncion,
              status: "curso",
            },
            metricas: {
              fecha: new Date(),
              fechaVela: this.ultimaVela("15m").closeTime,
              fechaVelaBerlin: convertToBerlinTime(
                this.ultimaVela("15m").closeTime
              ),
              precioCompra: this.price,
              stopLoss: stopLoss,
              totalBtc: compra,
              totalUsdt: usdt,
              compraHasCruceAlcista: this.hasCruceAlcista(idNameFuncion),
              compraUltimaVela: this.ultimaVela("15m"),

              compraEMA20_15m: this.EMA20_15m.at(-1),
              compraEMA8_RSI_15m: this.EMA8_RSI_15m,
              compraEMA26_RSI_15m: this.EMA26_RSI_15m,
              compraRSI14_15m: this.RSI14_15m.at(-1),
              compraIs_RSI_Alcista: this.is_RSI_Alcista("15m"),

              r2_1h: this.r2_1h,
              r1_1h: this.r1_1h,
              pp_1h: this.pp_1h,
              s1_1h: this.s1_1h,
              s2_1h: this.s2_1h,

              resistenciaActual_1h: this.resistenciaActual_1h,
              soporteActual_1h: this.soporteActual_1h,

              isZona1_1h: this.isZona1_1h,
              isZona2_1h: this.isZona2_1h,
              isZona3_1h: this.isZona3_1h,
              isZona4_1h: this.isZona4_1h,

              resistenciaZona1_1h: this.resistenciaZona1_1h,
              resistenciaZona2_1h: this.resistenciaZona2_1h,
              resistenciaZona3_1h: this.resistenciaZona3_1h,
              resistenciaZona4_1h: this.resistenciaZona4_1h,

              r2_4h: this.r2_4h,
              r1_4h: this.r1_4h,
              pp_4h: this.pp_4h,
              s1_4h: this.s1_4h,
              s2_4h: this.s2_4h,

              resistenciaActual_4h: this.resistenciaActual_4h,
              soporteActual_4h: this.soporteActual_4h,

              isZona1_4h: this.isZona1_4h,
              isZona2_4h: this.isZona2_4h,
              isZona3_4h: this.isZona3_4h,
              isZona4_4h: this.isZona4_4h,

              resistenciaZona1_4h: this.resistenciaZona1_4h,
              resistenciaZona2_4h: this.resistenciaZona2_4h,
              resistenciaZona3_4h: this.resistenciaZona3_4h,
              resistenciaZona4_4h: this.resistenciaZona4_4h,
            },
            candLesticksCompra: {
              velaCompra: this.ultimaVela("15m"),
              data15m: this.data15m,
              data1h: this.SR_1h,
              data4h: this.data4h,
            },
            binanceOrdenData: orden,
          };
          return data;
        }
      } catch (error) {
        console.log("Error en this.compra: ", error.message);
      }
    };

    this.vende = async (idNameFuncion, totalBtcVenta) => {
      const { informacion, candLesticksCompra, metricas, binanceOrdenData } =
        this.encontrarOrden(idNameFuncion);

      const orden = await client.order({
        symbol: "BTCUSDT",
        side: "SELL",
        type: "MARKET",
        quantity: totalBtcVenta,
      });

      const {
        fechaVelaBerlin,
        precioCompra,
        totalBtc,
        totalUsdt,
        compraHasCruceAlcista,
        compraUltimaVela,
        compraEMA20_15m,
        compraEMA8_RSI_15m,
        compraEMA26_RSI_15m,
        compraRSI14_15m,
        compraIs_RSI_Alcista,
        //>>>>>>>>>>>>>>>>>>>>>
        r2_1h,
        r1_1h,
        pp_1h,
        s1_1h,
        s2_1h,

        resistenciaActual_1h,
        soporteActual_1h,

        isZona1_1h,
        isZona2_1h,
        isZona3_1h,
        isZona4_1h,

        resistenciaZona1_1h,
        resistenciaZona2_1h,
        resistenciaZona3_1h,
        resistenciaZona4_1h,

        r2_4h,
        r1_4h,
        pp_4h,
        s1_4h,
        s2_4h,

        resistenciaActual_4h,
        soporteActual_4h,

        isZona1_4h,
        isZona2_4h,
        isZona3_4h,
        isZona4_4h,

        resistenciaZona1_4h,
        resistenciaZona2_4h,
        resistenciaZona3_4h,
        resistenciaZona4_4h,
        //>>>>>>>>>>>>>>>>>>>>>
      } = metricas;

      const data = {
        informacion,
        resultado: {
          transacion: "transacion",
          // fechaCompra: fechaVela,
          fechaCompraBerlin: fechaVelaBerlin,
          //fechaVenta: new Date(),
          //fechaVenta: this.ultimaVela("15m").closeTime,
          fechaVentaBerlin: convertToBerlinTime(
            this.ultimaVela("15m").closeTime
          ),
          precioCompra,
          precioVenta: this.price,
          btcOperacion: totalBtc,
          usdtOperacion: totalUsdt,
          retorno: ((this.price - precioCompra) / precioCompra) * 100,
          usdt: this.price * totalBtc,
          isGanancia: ((this.price - precioCompra) / precioCompra) * 100 > 0,
          isStopLoss: this.isStopLoss,
          ventaZona4: this.ventaResistenciaZona3,
        },
        venta: {
          candLesticksVenta: {
            ultimaVela: this.ultimaVela("1h"),
            data15m: this.data15m,
            data4h: this.data4h,
          },
          binanceOrdenData: orden,
        },
        compra: {
          candLesticksCompra,
          metricas,
          binanceOrdenData,
        },
      };

      informacion.status = "finalizado";
      this.isStopLoss = false;
      this.ventaRsi75 = false;
      this.resistenciaActualAlcanzada = false;
      this.ventaResistenciaZona3 = false;
      return data;
    };
  }

  ema8_ema26_rsi = async (interval, buySell) => {
    try {
      const idNameFuncion = `ema8_ema26_rsi${interval}`;
      const ultimaVela = this.ultimaVela(interval);
      const EMA8_RSI = this[`EMA8_RSI_${interval}`];
      const EMA26_RSI = this[`EMA26_RSI_${interval}`];
      const EMA20 = this[`EMA20_${interval}`].at(-1);
      const {
        r2: r2_4h,
        r1: r1_4h,
        pp: pp_4h,
        s1: s1_4h,
        s2: s2_4h,
        resistenciaActual,
        soporteActual,
        isZona1,
        isZona2,
        isZona3,
        isZona4,
        resistenciaZona1,
        resistenciaZona2,
        resistenciaZona3,
        resistenciaZona4,
      } = this.SR_4h;

      if (verGraficos) {
        console.clear();
        console.log("\n" + "=".repeat(70)); // Línea superior

        console.log("📊 CONTEXTO DEL MERCADO (4H)".padStart(45));
        console.log("-".repeat(70));
        console.log(`  📈 Resistencia #2: `.padEnd(30), r2_4h);
        console.log(`  📈 Resistencia #1: `.padEnd(30), r1_4h);
        console.log(`  🔹 Punto Pivote (PP): `.padEnd(30), pp_4h);
        console.log(`  📉 Soporte #1: `.padEnd(30), s1_4h);
        console.log(`  📉 Soporte #2: `.padEnd(30), s2_4h);

        console.log("\n" + "=".repeat(70));
        console.log("📍 SOPORTE Y RESISTENCIA ACTUALES".padStart(45));
        console.log("-".repeat(70));
        console.log(`  🔺 Resistencia actual: `.padEnd(30), resistenciaActual);
        console.log(`  🔻 Soporte actual: `.padEnd(30), soporteActual);

        console.log("\n" + "=".repeat(70));
        console.log("📌 EN ESTA ZONA ESTÁ EL PRECIO".padStart(45));
        console.log("-".repeat(70));
        console.log(`  🟢 ¿Está en la zona 1? `.padEnd(30), isZona1);
        console.log(`  🟡 ¿Está en la zona 2? `.padEnd(30), isZona2);
        console.log(`  🟠 ¿Está en la zona 3? `.padEnd(30), isZona3);
        console.log(`  🔴 ¿Está en la zona 4? `.padEnd(30), isZona4);

        console.log("\n" + "=".repeat(70));
        console.log("🏁 RESISTENCIA DE CADA ZONA".padStart(45));
        console.log("-".repeat(70));
        console.log(`  🟦 Resistencia zona 1: `.padEnd(30), resistenciaZona1);
        console.log(`  🟦 Resistencia zona 2: `.padEnd(30), resistenciaZona2);
        console.log(`  🟦 Resistencia zona 3: `.padEnd(30), resistenciaZona3);
        console.log(`  🟦 Resistencia zona 4: `.padEnd(30), resistenciaZona4);

        console.log("\n" + "=".repeat(70));
        console.log("📈 INDICADORES DE LA ESTRATEGIA".padStart(45));
        console.log("-".repeat(70));
        console.log(`  📊 Precio BTCUSDT: `.padEnd(30), this.price);
        console.log(`  📊 EMA 20: `.padEnd(30), EMA20);
        console.log(`  📊 EMA 8 RSI: `.padEnd(30), EMA8_RSI);
        console.log(`  📊 EMA 26 RSI: `.padEnd(30), EMA26_RSI);

        console.log("=".repeat(70) + "\n");
      }

      if (buySell === "buy") {
        console.log("=== Primeras Condiciones ===");
        console.log("this.isZona3_4h (false):", this.isZona3_4h);
        console.log("this.isZona4_4h (false):", this.isZona4_4h);
        console.log(
          "Resistencia actual (Tiene que existir una resistencia):",
          resistenciaActual
        );

        if (!this.isZona3_4h && !this.isZona4_4h && resistenciaActual) {
          console.log("✅ 1/4 condiciones de compra cumplidas", new Date());
          console.log(">>");
          console.log("=== Segunda Condición ===");
          console.log(
            "this.hasCruceAlcista(idNameFuncion) (true):",
            this.hasCruceAlcista(idNameFuncion)
          );

          if (this.hasCruceAlcista(idNameFuncion)) {
            console.log("✅ 2/4 condiciones de compra cumplidas", new Date());
            console.log(">>");
            console.log("=== Tercera Condición ===");
            console.log(
              "this.is_RSI_Alcista(interval) (true):",
              this.is_RSI_Alcista(interval)
            );
            console.log("EMA8_RSI (>= 50 y <= 65):", EMA8_RSI);
            console.log(
              "Condición EMA8_RSI cumple:",
              EMA8_RSI >= 50 && EMA8_RSI <= 65
            );

            if (
              this.is_RSI_Alcista(interval) &&
              EMA8_RSI >= 50 &&
              EMA8_RSI <= 65
            ) {
              console.log("✅ 3/4 condiciones de compra cumplidas", new Date());
              console.log(">>");
              console.log("=== Cuarta Condición ===");
              console.log(
                "¿La última vela es verde?",
                this.isVelaVerde(ultimaVela)
              );
              console.log(
                "¿Cerró por encima de la EMA de 20?",
                parseFloat(ultimaVela.close) > EMA20
              );

              if (
                this.isVelaVerde(ultimaVela) &&
                parseFloat(ultimaVela.close) > EMA20
              ) {
                console.log(
                  "✅ 4/4 condiciones de compra cumplidas",
                  new Date()
                );
                const data = await this.compra(idNameFuncion);
                if (data) {
                  console.log(data);
                  return data;
                }
              }
            }
          }
        }
      } else if (buySell === "sell") {
        const myOperacion = this.encontrarOrden(idNameFuncion);
        const { stopLoss, totalBtc } = myOperacion.metricas;

        console.log("=== Iniciando proceso de venta ===");
        console.log(`RSI (EMA8): ${EMA8_RSI}`);
        console.log(`Stop Loss: ${stopLoss}`);
        console.log(`Total BTC: ${totalBtc}`);

        if (this.price < stopLoss) {
          console.log("❌ Venta en Stop Loss activada");
          this.isStopLoss = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }

        console.log(">> Evaluando condiciones para venta estándar...");
        if (EMA8_RSI < EMA26_RSI && !this.is_RSI_Alcista(interval)) {
          console.log("✅ 1/2 condiciones de venta cumplidas", new Date());

          if (
            !this.isVelaVerde(ultimaVela) &&
            parseFloat(ultimaVela.close) < EMA20
          ) {
            console.log("✅ 2/2 condiciones de venta cumplidas", new Date());
            const data = await this.vende(idNameFuncion, totalBtc);
            if (data) {
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

const getVelasData = async (symbol, interval, limit) => {
  const velas = await client.candles({
    symbol: symbol,
    interval: interval,
    limit: limit,
  });
  return velas;
};

function logInstrucciones() {
  console.clear();
  console.log("\n".repeat(2)); // Espacios antes del mensaje

  console.log("=".repeat(70)); // Línea superior
  console.log(
    " ".repeat(10) + "🛠️  INSTRUCCIONES BÁSICAS PARA USAR EL BOT  🛠️"
  );
  console.log("=".repeat(70)); // Línea inferior

  console.log("\n📋 **¿Cómo detener el bot?**");
  console.log(
    "  - Si el bot está en ejecución y quieres detenerlo:\n" +
      "    👉 Presiona 'Ctrl + C' en la terminal.\n" +
      "    Esto detendrá la ejecución actual del bot.\n"
  );

  console.log("🔄 **¿Cómo reiniciar el bot?**");
  console.log(
    "  - Si necesitas reiniciar el bot después de detenerlo:\n" +
      "    👉 Escribe uno de estos comandos en la terminal y presiona 'Enter':\n" +
      "       - node index.js\n" +
      "       - npm start\n"
  );

  console.log("❌ **¿Cómo cerrar la terminal?**");
  console.log(
    "  - Si quieres cerrar la terminal completamente:\n" +
      "    👉 Haz clic en la 'X' en la esquina superior derecha de la terminal.\n" +
      "    👉 O escribe 'exit' y presiona 'Enter'.\n"
  );

  console.log("\n💡 **Recomendaciones:**");
  console.log(
    "  - Siempre monitorea el bot mientras esté activo.\n" +
      "  - Si el bot tiene una operación abierta, deberás vender manualmente si lo detienes.\n" +
      "  - Reinicia el bot solo cuando estés seguro de que todo está bajo control."
  );

  console.log("\n".repeat(2)); // Espacios después del mensaje
}

const trader = async () => {
  const prices = await client.prices().then((prices) => {
    const listaPrecios = {
      BTCUSDT: parseFloat(parseFloat(prices.BTCUSDT).toFixed(2)),
      ETHUSDT: parseFloat(parseFloat(prices.ETHUSDT).toFixed(2)),
    };

    return listaPrecios;
  });

  const data1mArr = await getVelasData(symbol, "1m", 60);
  const data5mArr = await getVelasData(symbol, "5m", 60);
  const data15mArr = await getVelasData(symbol, "15m", 60);
  const data30mArr = await getVelasData(symbol, "30m", 60);
  const data1hmArr = await getVelasData(symbol, "1h", 60);
  const data4hArr = await getVelasData(symbol, "4h", 60);

  const obtenerIndicadores = (velas, interval, price) => {
    const priceCloseArr = velas.map((vela) => parseFloat(vela.close));

    const ema10 = indicadores.calculateEMA(priceCloseArr, 10);

    const ema20 = indicadores.calculateEMA(priceCloseArr, 20);

    const ema50 = indicadores.calculateEMA(priceCloseArr, 50);

    const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);

    const ema8_rsi = indicadores.calculateEMA_RSI(rsi14, 8);

    const ema26_rsi = indicadores.calculateEMA_RSI(rsi14, 26);

    const getHasVolumen = indicadores.calculateHasVolumen(velas.slice(-5));

    const sopResObj = indicadores.calculateSopRes(priceCloseArr, price);

    const data = {
      candLesticksInterval: interval,
      candLesticks: velas,
      indicadores: {
        [`EMA10_${interval}`]: ema10,
        [`EMA20_${interval}`]: ema20,
        [`EMA50_${interval}`]: ema50,
        [`RSI14_${interval}`]: rsi14,
        [`EMA8_RSI_${interval}`]: ema8_rsi,
        [`EMA26_RSI_${interval}`]: ema26_rsi,
        [`ultimasVelasData_${interval}`]: {
          ultimasVelas: velas.slice(-5),
          hasVolumen:
            getHasVolumen.hasVolumen3velas || getHasVolumen.hasVolumen5velas,
          hasVolumen3Velas: getHasVolumen.hasVolumen3velas,
          hasVolumen5Velas: getHasVolumen.hasVolumen5velas,
        },
        [`SR_${interval}`]: sopResObj,
      },
    };
    if (!data) {
      throw new Error(
        `Error al entregar los datos de obtenerIndicadores en este intervalo ${interval}`
      );
    }
    return data;
  };

  const myData1 = obtenerIndicadores(data1mArr, "1m", prices.BTCUSDT);
  const myData5 = obtenerIndicadores(data5mArr, "5m", prices.BTCUSDT);
  const myData15 = obtenerIndicadores(data15mArr, "15m", prices.BTCUSDT);
  const myData30 = obtenerIndicadores(data30mArr, "30m", prices.BTCUSDT);
  const myData1h = obtenerIndicadores(data1hmArr, "1h", prices.BTCUSDT);
  const myData4h = obtenerIndicadores(data4hArr, "4h", prices.BTCUSDT);

  myData.ultimosIndicadores.velas1m.push(myData1.indicadores);
  myData.ultimosIndicadores.velas5m.push(myData5.indicadores);
  myData.ultimosIndicadores.velas15m.push(myData15.indicadores);
  myData.ultimosIndicadores.velas30m.push(myData30.indicadores);
  myData.ultimosIndicadores.velas1h.push(myData1h.indicadores);
  myData.ultimosIndicadores.velas4h.push(myData4h.indicadores);

  if (myData.ultimosIndicadores.velas1m.length > 10) {
    myData.ultimosIndicadores.velas1m =
      myData.ultimosIndicadores.velas1m.slice(-10);
  }
  if (myData.ultimosIndicadores.velas5m.length > 10) {
    myData.ultimosIndicadores.velas5m =
      myData.ultimosIndicadores.velas5m.slice(-10);
  }
  if (myData.ultimosIndicadores.velas15m.length > 10) {
    myData.ultimosIndicadores.velas15m =
      myData.ultimosIndicadores.velas15m.slice(-10);
  }
  if (myData.ultimosIndicadores.velas30m.length > 10) {
    myData.ultimosIndicadores.velas30m =
      myData.ultimosIndicadores.velas30m.slice(-10);
  }
  if (myData.ultimosIndicadores.velas1h.length > 10) {
    myData.ultimosIndicadores.velas1h =
      myData.ultimosIndicadores.velas1h.slice(-10);
  }
  if (myData.ultimosIndicadores.velas4h.length > 10) {
    myData.ultimosIndicadores.velas4h =
      myData.ultimosIndicadores.velas4h.slice(-10);
  }

  const estrategias = new Estrategias(
    myData1,
    myData5,
    myData15,
    myData30,
    myData1h,
    myData4h,
    prices.BTCUSDT,
    myData.compras,
    myData.ultimosIndicadores
  );

  function logOperacionAbierta() {
    console.clear(); // Limpia la terminal
    console.log("\n".repeat(2)); // Espacios antes del mensaje

    console.log("=".repeat(70)); // Línea superior
    console.log(" ".repeat(20) + "⚠️ OPERACIÓN ABIERTA ⚠️"); // Título centrado
    console.log("=".repeat(70)); // Línea inferior

    console.log("\n¡ATENCIÓN!");
    console.log(
      "El bot tiene una operación abierta.\n" +
        "Si cierras el bot, tendrás que vender manualmente."
    );

    console.log("\nAcciones a considerar:");
    console.log(
      "  - Monitorear el mercado.\n" +
        "  - Mantener el bot activo para condiciones automáticas.\n" +
        "  - Vender manualmente si decides detener el bot.\n" +
        "  - Si vendiste manualmente, debes reiniciar el bot para que funcione nuevamente.\n"
    );

    console.log("¿Cómo reiniciar el bot?");
    console.log(
      "  - Presiona 'Ctrl + C' para detener el bot.\n" +
        "  - Luego, inicia el bot nuevamente con uno de los siguientes comandos:\n" +
        "    👉 node index.js\n" +
        "    👉 npm start"
    );

    console.log("\n".repeat(2)); // Espacios después del mensaje
  }

  // === Control Principal para Estrategias ===

  // Busca Compra
  if (myData.compras.length < 1) {
    console.log(">> Evaluando condiciones para compra...");
    const buy = await estrategias.ema8_ema26_rsi(temporalidad, "buy");

    if (buy) {
      console.log("✅ Compra realizada:", buy);
      myData.compras.push(buy);
    } else {
      console.log(
        `⏳ Última revisión en ${symbol} (${temporalidad}) a las ${new Date()}. Próximo chequeo en ${
          tiempoEvaluacion / 1000
        } segundos`
      );
    }
  }

  // Busca Venta

  if (myData.compras.length >= 1) {
    logOperacionAbierta();
    console.log(">> Evaluando condiciones para venta...");
    for (let i = 0; i < myData.compras.length; i++) {
      if (myData.compras[i].informacion.id === idEstrategia) {
        const sell = await estrategias.ema8_ema26_rsi(temporalidad, "sell");

        if (sell) {
          if (sell.informacion.status === "finalizado") {
            console.log("✅ Venta realizada. Resultado:", sell.resultado);

            // Actualiza el historial y elimina la orden vendida
            const ventaId = sell.compra.binanceOrdenData.orderId;
            myData.compras = myData.compras.filter(
              (item) => item.binanceOrdenData.orderId !== ventaId
            );
            myData.historial.push(sell);

            console.log("Historial actualizado con la venta:", sell);
          }
        }
      }
    }
  }
  setTimeout(logInstrucciones, 20000);
};

setInterval(trader, tiempoEvaluacion);
