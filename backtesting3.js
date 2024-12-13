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

          const inversionUsdt = 20; //await balances.balance("USDT");
          const perdidaMaxima = inversionUsdt * 0.02;
          const stopLoss = parseFloat(
            (this.price - this.price * 0.01).toFixed(2)
          ); /*parseFloat(this.ultimaVela("1h").low);*/
          //console.log("Vela", this.ultimaVela("1h"), "stopLoss", stopLoss);

          const compra = inversionUsdt / this.price;
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

      if (buySell === "buy") {
        if (!this.isZona3_4h && !this.isZona4_4h && resistenciaActual) {
          if (this.hasCruceAlcista(idNameFuncion)) {
            if (
              this.is_RSI_Alcista(interval) &&
              EMA8_RSI >= 50 &&
              EMA8_RSI <= 65
            ) {
              if (
                this.isVelaVerde(ultimaVela) &&
                parseFloat(ultimaVela.close) > EMA20
              ) {
                const data = await this.compra(idNameFuncion);
                if (data) {
                  return data;
                }
              }
            }
          }
        }
      } else if (buySell === "sell") {
        const myOperacion = this.encontrarOrden(idNameFuncion);
        const { stopLoss, totalBtc } = myOperacion.metricas;

        console.log(`RSI ${EMA8_RSI}`);

        if (this.price < stopLoss) {
          this.isStopLoss = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }

        if (EMA8_RSI < EMA26_RSI && !this.is_RSI_Alcista(interval)) {
          if (
            !this.isVelaVerde(ultimaVela) &&
            parseFloat(ultimaVela.close) < EMA20
          ) {
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

const getVelasData = async (symbol, interval, startTime, endTime) => {
  const UN_ANO_MS = 365 * 24 * 60 * 60 * 1000; // 365 días

  // Validación del rango de tiempo
  if (endTime - startTime > UN_ANO_MS) {
    throw new Error(
      "El rango de tiempo no puede exceder un año. Ajusta las fechas."
    );
  }
  let fechaActual = startTime;
  let totalVelas = [];

  while (fechaActual < endTime) {
    try {
      const velas = await client.candles({
        symbol: symbol,
        interval: interval,
        limit: 1000, // Máximo permitido por la API
        startTime: fechaActual,
      });
      if (velas.length === 0) {
        // console.log("No se obtuvieron más datos, finalizando.");
        break;
      }

      totalVelas.push(...velas);
      fechaActual = velas[velas.length - 1].closeTime;

      /* console.log(
          `Solicitadas ${velas.length} velas. Fecha actualizada:`,
          new Date(fechaActual).toISOString()
        );*/

      if (fechaActual >= endTime) {
        // console.log("Alcanzada la fecha final.");
        break;
      }
    } catch (error) {
      console.log("Error en el bucle de la funciongetVelasData", error.message);
      break;
    }
  }
  // console.log("Estas son todas las velas de esta solicitud: ", totalVelas);

  return totalVelas;
};

//const endTime = //Actualizar con la ultima fecha

let conteo = 0;
let symbol = "BTCUSDT";
const temporalidad = "1h";
const idEstrategia = `ema8_ema26_rsi${temporalidad}`;

let actualizarVelas5m = 0;
let actualizarVelas15m = 0;
let actualizarVelas30m = 0;
let actualizarVelas1h = 0;
let actualizarVelas4h = 0;

const backtesting = async (fechaStartBacktesting, fechaEndBacktesting) => {
  const startBacktesting = fechaStartBacktesting; //new Date("2024-11-01T00:00:00.000Z").getTime();
  const endBacktesting = fechaEndBacktesting; // new Date().getTime();
  console.log(
    "startBacktesting",
    startBacktesting,
    "=",
    convertToBerlinTime(startBacktesting)
  );
  console.log(
    "endBacktesting",
    endBacktesting,
    "=",
    convertToBerlinTime(endBacktesting)
  );

  const banckData1m = await getVelasData(
    symbol,
    "1m",
    startBacktesting,
    endBacktesting
  );

  const banckData5m = await getVelasData(
    symbol,
    "5m",
    startBacktesting,
    endBacktesting
  );

  const banckData15m = await getVelasData(
    symbol,
    "15m",
    startBacktesting,
    endBacktesting
  );

  const banckData30m = await getVelasData(
    symbol,
    "30m",
    startBacktesting,
    endBacktesting
  );

  const banckData1h = await getVelasData(
    symbol,
    "1h",
    startBacktesting,
    endBacktesting
  );

  const banckData4h = await getVelasData(
    symbol,
    "4h",
    startBacktesting,
    endBacktesting
  );

  console.log("Total de velas banckData1m: ", banckData1m.length);
  console.log("Total de velas banckData5m: ", banckData5m.length);
  console.log("Total de velas banckData15m: ", banckData15m.length);
  console.log("Total de velas banckData30m: ", banckData30m.length);
  console.log("Total de velas banckData1h: ", banckData1h.length);
  console.log("Total de velas banckData4h: ", banckData4h.length);

  let actualizarArrData = 14400;
  const buscarVela = (banckData, ultimosDatos1m) => {
    const horaCierreVelaDeseada = ultimosDatos1m.slice(-1)[0].closeTime;
    const velaDeseada = banckData.find(
      (vela) =>
        vela.openTime <= horaCierreVelaDeseada &&
        vela.closeTime >= horaCierreVelaDeseada
    );
    if (!velaDeseada) {
      throw new Error(
        `Error No se actualizó correctamente la función buscarVela`
      );
    }
    const indiceVela = banckData.findIndex(
      (vela) => vela.close === velaDeseada.close
    );
    if (indiceVela === -1) {
      console.error(
        "Error: No se encontró el índice de la vela de 4 horas correspondiente."
      );
      throw new Error("Error al buscar el índice de la vela de 4 horas.");
    }
    return indiceVela;
  };

  let data1mArr = banckData1m.slice(0, actualizarArrData);

  let data5mArr = banckData5m.slice(0, buscarVela(banckData5m, data1mArr) + 1);

  let data15mArr = banckData15m.slice(
    0,
    buscarVela(banckData15m, data1mArr) + 1
  );

  let data30mArr = banckData30m.slice(
    0,
    buscarVela(banckData30m, data1mArr) + 1
  );

  let data1hArr = banckData1h.slice(0, buscarVela(banckData1h, data1mArr) + 1);

  let data4hArr = banckData4h.slice(0, buscarVela(banckData4h, data1mArr) + 1);

  console.log("data1mArr", data1mArr.length);
  console.log("data5mArr", data5mArr.length);
  console.log("data15mArr", data15mArr.length);
  console.log("data30mArr", data30mArr.length);
  console.log("data1hArr", data1hArr.length);
  console.log("data4hArr", data4hArr.length);

  while (true) {
    try {
      const priceActual = data1mArr.slice(-1)[0].close;

      const priceCloseArr_1m = data1mArr.map((vela) => parseFloat(vela.close));
      const priceCloseArr_5m = data5mArr.map((vela) => parseFloat(vela.close));
      const priceCloseArr_15m = data15mArr.map((vela) =>
        parseFloat(vela.close)
      );
      const priceCloseArr_30m = data30mArr.map((vela) =>
        parseFloat(vela.close)
      );
      const priceCloseArr_1h = data1hArr.map((vela) => parseFloat(vela.close));
      const priceCloseArr_4h = data4hArr.map((vela) => parseFloat(vela.close));

      const obtenerIndicadores = (velas, interval, price, priceCloseArr) => {
        const ema10 = indicadores.calculateEMA(priceCloseArr, 10);
        const ema20 = indicadores.calculateEMA(priceCloseArr, 20);
        const ema50 = indicadores.calculateEMA(priceCloseArr, 50);
        const rsi14 = indicadores.calculateRSI(priceCloseArr, 14);
        const ema_rsi8 = indicadores.calculateEMA_RSI(rsi14, 8);
        const ema_rsi26 = indicadores.calculateEMA_RSI(rsi14, 26);
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
            [`EMA_RSI8_${interval}`]: ema_rsi8,
            [`EMA_RSI26_${interval}`]: ema_rsi26,
            [`ultimasVelasData_${interval}`]: {
              ultimasVelas: velas.slice(-5),
              hasVolumen:
                getHasVolumen.hasVolumen3velas ||
                getHasVolumen.hasVolumen5velas,
              hasVolumen3Velas: getHasVolumen.hasVolumen3velas,
              hasVolumen5Velas: getHasVolumen.hasVolumen5velas,
            },
            [`SR_${interval}`]: sopResObj,
          },
        };

        return data;
      };

      const myData1 = obtenerIndicadores(
        data1mArr,
        "1m",
        priceActual,
        priceCloseArr_1m
      );
      const myData5 = obtenerIndicadores(
        data5mArr,
        "5m",
        priceActual,
        priceCloseArr_5m
      );
      const myData15 = obtenerIndicadores(
        data15mArr,
        "15m",
        priceActual,
        priceCloseArr_15m
      );
      const myData30 = obtenerIndicadores(
        data15mArr,
        "30m",
        priceActual,
        priceCloseArr_30m
      );

      const myData1h = obtenerIndicadores(
        data1hArr,
        "1h",
        priceActual,
        priceCloseArr_1h
      );
      const myData4h = obtenerIndicadores(
        data4hArr,
        "4h",
        priceActual,
        priceCloseArr_4h
      );

      /*console.log("myData1", myData1.indicadores);
      console.log("myData5", myData5.indicadores);
      console.log("myData15", myData15.indicadores);
      console.log("myData30", myData30.indicadores);
      console.log("myData1h", myData1h.indicadores);
      console.log("myData4h", myData4h.indicadores);*/

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
        priceActual,
        myData.compras,
        myData.ultimosIndicadores
      );

      // Busca compra
      if (myData.compras.length < 1) {
        const buy = await estrategias.ema8_ema26_rsi(temporalidad, "buy");

        if (buy) {
          myData.compras.push(buy);
        }
      }

      // Busca Venta
      if (myData.compras.length >= 1) {
        for (let i = 0; i < myData.compras.length; i++) {
          if (myData.compras[i].informacion.id === idEstrategia) {
            const sell = await estrategias.ema8_ema26_rsi(temporalidad, "sell");

            if (sell) {
              if (sell.informacion.status === "finalizado") {
                // ELIMINO
                const ventaId = sell.compra.binanceOrdenData.orderId;
                const nuevoArr = myData.compras.filter(
                  (item) => item.binanceOrdenData.orderId !== ventaId
                );
                myData.compras = nuevoArr;

                console.log("Resultado: ", sell.resultado);
                console.log(">>>>>>>>>>");
                console.log(">>>>>>>>>>");

                myData.historial.push(sell);
              }
            }
          }
        }
      }

      actualizarArrData++;
      actualizarVelas5m++;
      actualizarVelas15m++;
      actualizarVelas30m++;
      actualizarVelas1h++;
      actualizarVelas4h++;

      data1mArr = banckData1m.slice(
        Math.max(0, actualizarArrData - 14399),
        actualizarArrData
      );

      if (actualizarVelas5m === 5) {
        actualizarVelas5m = 0;
        data5mArr = banckData5m.slice(
          Math.max(0, buscarVela(banckData5m, data1mArr) - 2879),
          buscarVela(banckData5m, data1mArr) + 1
        );
      }

      if (actualizarVelas15m === 15) {
        actualizarVelas15m = 0;
        data15mArr = banckData15m.slice(
          Math.max(0, buscarVela(banckData15m, data1mArr) - 959),
          buscarVela(banckData15m, data1mArr) + 1
        );
      }

      if (actualizarVelas30m === 30) {
        actualizarVelas30m = 0;
        data30mArr = banckData30m.slice(
          Math.max(0, buscarVela(banckData30m, data1mArr) - 479),
          buscarVela(banckData30m, data1mArr) + 1
        );
      }

      if (actualizarVelas1h === 60) {
        actualizarVelas1h = 0;
        data1hArr = banckData1h.slice(
          Math.max(0, buscarVela(banckData1h, data1mArr) - 239),
          buscarVela(banckData1h, data1mArr) + 1
        );
      }

      if (actualizarVelas4h === 240) {
        actualizarVelas4h = 0;
        data4hArr = banckData4h.slice(
          Math.max(0, buscarVela(banckData4h, data1mArr) - 59),
          buscarVela(banckData4h, data1mArr) + 1
        );
      }

      if (data1mArr.slice(-1)[0].closeTime >= endBacktesting) {
        console.log("Arr recorrido completo");
        break;
      }
    } catch (error) {
      console.log("Error en Backtesting", error.message);
      break;
    }
  }
  const historial = myData.historial;

  // Totales de operaciones ganadoras y perdedoras
  const totalGanadoras = historial.filter(
    (operacion) => operacion.resultado.isGanancia === true
  ).length;
  // Ganancia total y pérdida total
  const gananciaTotal = parseFloat(
    historial
      .filter((operacion) => operacion.resultado.isGanancia === true)
      .map((operacion) => operacion.resultado.usdt - 20)
      .reduce((a, b) => a + b, 0)
      .toFixed(2)
  );
  // Promedios de ganancia y pérdida
  const gananciaPromedio = parseFloat(
    (gananciaTotal / totalGanadoras || 0).toFixed(2)
  );

  const totalPerdedoras = historial.filter(
    (operacion) => operacion.resultado.isGanancia === false
  ).length;

  const perdidaTotal = parseFloat(
    Math.abs(
      historial
        .filter((operacion) => operacion.resultado.isGanancia === false)
        .map((operacion) => operacion.resultado.usdt - 20)
        .reduce((a, b) => a + b, 0)
    ).toFixed(2)
  );

  const perdidaPromedio = parseFloat(
    (perdidaTotal / totalPerdedoras || 0).toFixed(2)
  );

  //total stoploss
  const totalStopLoss = historial.filter(
    (operacion) => operacion.resultado.isStopLoss === true
  ).length;

  // Fórmulas de rendimiento
  const winRate = parseFloat(
    ((totalGanadoras / historial.length) * 100 || 0).toFixed(2)
  );
  const winLossRatio = parseFloat(
    (totalGanadoras / totalPerdedoras || 0).toFixed(2)
  );
  const profitFactor = parseFloat(
    (gananciaTotal / perdidaTotal || 0).toFixed(2)
  );

  // Expected Value (EV)
  const probabilidadGanar = parseFloat(
    (totalGanadoras / historial.length || 0).toFixed(2)
  );
  const probabilidadPerder = parseFloat(
    (totalPerdedoras / historial.length || 0).toFixed(2)
  );
  const expectedValue = parseFloat(
    (
      probabilidadGanar * gananciaPromedio -
        probabilidadPerder * perdidaPromedio || 0
    ).toFixed(2)
  );

  // Drawdown (máxima caída)
  let maxDrawdown = 0;
  let peak = 0;
  historial.reduce((equity, operacion) => {
    const nuevoEquity =
      equity +
      (operacion.resultado.isGanancia
        ? operacion.resultado.usdt - 20
        : -(20 - operacion.resultado.usdt));
    peak = Math.max(peak, nuevoEquity);
    const drawdown = peak - nuevoEquity;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    return nuevoEquity;
  }, 0);
  maxDrawdown = parseFloat(maxDrawdown.toFixed(2));

  // Datos de resumen
  const data = {
    fechaInicio: new Date(fechaStartBacktesting),
    fechaFinal: new Date(fechaEndBacktesting),
    resumenOperaciones: {
      totalAbiertas: historial.length,
      promedioMes: historial.length / 12,
      totalGanadoras,
      totalPerdedoras,
      totalStopLoss,
      gananciaTotal,
      gananciaPromedio,
      probabilidadGanar,
      perdidaTotal,
      perdidaPromedio,
      probabilidadPerder,
      rendimiento: {
        winRate,
        winLossRatio,
        profitFactor,
        expectedValue,
        maxDrawdown,
      },
    },
    // resultadoHistorial: historial.map((operacion) => operacion.resultado),
  };

  return data;
};

(async () => {
  const resultado = await backtesting(
    new Date("2024-11-01T00:00:00.000Z").getTime(),
    new Date(/*"2024-12-31T00:00:00.000Z"*/).getTime()
  );
  console.log(resultado);
})();

/*    new Date("2024-10-24T00:00:00.000Z").getTime(),
    new Date("2024-11-06T00:00:00.000Z").getTime()
     */
