const symbol = "BTCUSDT";
const temporalidad = "1h";

//NO TOQUES NADA A PARTIR DE AQUI SI NO DOMINAS JAVASCRIPT
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
    //console.log(" this.data5m", this.data5m);
    // console.log(" this.data15m", this.data15m);
    // console.log(" this.data30m", this.data30m);
    // console.log(" this.data1h", this.data1h);
    //  console.log(" this.data4h", this.data4h);

    //Velas en el presente
    this.velas1m = this.data1m.candLesticks;
    this.velas5m = this.data5m.candLesticks;
    this.velas15m = this.data15m.candLesticks;
    this.velas30m = this.data30m.candLesticks;
    this.velas1h = this.data1h.candLesticks;
    this.velas4h = this.data4h.candLesticks;

    //console.log("velas1m", this.velas1m);
    // console.log("velas5m", this.velas5m);
    // console.log("velas15m", this.velas15m);
    //console.log("velas30m", this.velas30m);
    // console.log("velas1h", this.velas1h);
    // console.log("velas4h", this.velas4h);

    // Indicadores
    this.indicadores1m = this.data1m.indicadores;
    this.indicadores5m = this.data5m.indicadores;
    this.indicadores15m = this.data15m.indicadores;
    this.indicadores30m = this.data30m.indicadores;
    this.indicadores1h = this.data1h.indicadores;
    this.indicadores4h = this.data4h.indicadores;

    // console.log("indicadores1m", this.indicadores1m);
    // console.log("indicadores5m", this.indicadores5m);
    // console.log("indicadores15m", this.indicadores15m);
    // console.log("indicadores30m", this.indicadores30m);
    // console.log("indicadores1h", this.indicadores1h);
    // console.log("indicadores4h", this.indicadores4h);

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
              this.ultimosIndicadores.velas1m.slice(-10)[0].EMA8_RSI_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas1m.slice(-5)[0].EMA8_RSI_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas1m.slice(-5)[0].EMA8_RSI_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas1m.slice(-1)[0].EMA8_RSI_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas1m.slice(-1)[0].EMA26_RSI_1h;
            /* if (this.ultimaVela("1h").openTime === 1730788200000) {
            console.log("rsi10maEma8", rsi10maEma8);
            console.log("rsiUltEma8", rsiUltEma8);
            console.log("rsiUltEma26", rsiUltEma26);
            console.log(
              "rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26",
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26
            );
          }*/
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
              this.ultimosIndicadores.velas5m.slice(-10)[0].EMA8_RSI_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas5m.slice(-5)[0].EMA8_RSI_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas5m.slice(-5)[0].EMA8_RSI_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas5m.slice(-1)[0].EMA8_RSI_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas5m.slice(-1)[0].EMA26_RSI_1h;
            /* if (this.ultimaVela("1h").openTime === 1730788200000) {
            console.log("rsi10maEma8", rsi10maEma8);
            console.log("rsiUltEma8", rsiUltEma8);
            console.log("rsiUltEma26", rsiUltEma26);
            console.log(
              "rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26",
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26
            );
          }*/
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
              this.ultimosIndicadores.velas15m.slice(-10)[0].EMA8_RSI_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas15m.slice(-5)[0].EMA8_RSI_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas15m.slice(-5)[0].EMA8_RSI_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA8_RSI_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA26_RSI_1h;
            /* if (this.ultimaVela("1h").openTime === 1730788200000) {
            console.log("rsi10maEma8", rsi10maEma8);
            console.log("rsiUltEma8", rsiUltEma8);
            console.log("rsiUltEma26", rsiUltEma26);
            console.log(
              "rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26",
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26
            );
          }*/
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
              this.ultimosIndicadores.velas30m.slice(-10)[0].EMA8_RSI_1h;
            const rsi5taEma8 =
              this.ultimosIndicadores.velas30m.slice(-5)[0].EMA8_RSI_1h;
            const rsiPenultimaEma8 =
              this.ultimosIndicadores.velas30m.slice(-5)[0].EMA8_RSI_1h;
            const rsiUltEma8 =
              this.ultimosIndicadores.velas30m.slice(-1)[0].EMA8_RSI_1h;
            const rsiUltEma26 =
              this.ultimosIndicadores.velas30m.slice(-1)[0].EMA26_RSI_1h;
            /* if (this.ultimaVela("1h").openTime === 1730788200000) {
            console.log("rsi10maEma8", rsi10maEma8);
            console.log("rsiUltEma8", rsiUltEma8);
            console.log("rsiUltEma26", rsiUltEma26);
            console.log(
              "rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26",
              rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26
            );
          }*/
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
            /* if (this.ultimaVela("1h").openTime === 1730788200000) {
              console.log("rsi10maEma8", rsi10maEma8);
              console.log("rsiUltEma8", rsiUltEma8);
              console.log("rsiUltEma26", rsiUltEma26);
              console.log(
                "rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26",
                rsiUltEma8 > rsiUltEma26 && rsi10maEma8 < rsiUltEma26
              );
            }*/
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
          case "ema8_ema26_rsi15m":
            const rsi5taEma8 =
              this.ultimosIndicadores.velas15m.slice(-2)[0].EMA8_RSI_15m;
            // console.log("rsi5taEma8", rsi5taEma8);

            const rsiUltEma8 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA8_RSI_15m;
            // console.log("rsiUltEma8", rsiUltEma8);

            /*const rsiPenultimaEma26 =
              this.ultimosIndicadores.velas15m.slice(-2)[0].EMA26_RSI_15m;*/

            const rsiUltEma26 =
              this.ultimosIndicadores.velas15m.slice(-1)[0].EMA26_RSI_15m;
            // console.log("rsiUltEma26", rsiUltEma26);

            return rsiUltEma8 < rsiUltEma26 && rsi5taEma8 > rsiUltEma26;
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false; // O el valor por defecto que desees.
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

        // console.log(`ultimoRsi${intervalo}`, ultimoRsi);
        // console.log(`penultimoRsi${intervalo}`, penultimoRsi);
        // console.log("penultimoEmaRsi", penultimoEmaRsi);
        // console.log("ultimoEmaRsi", ultimoEmaRsi);

        /* if (this.ultimaVela("1h").openTime === 1730788200000) {
          console.log("velasKey", velasKey);
          console.log("emaRsi8Key", emaRsi8Key);
          console.log("penultimoEmaRsi", penultimoEmaRsi);
          console.log("ultimoEmaRsi", ultimoEmaRsi);
        }*/

        return ultimoEmaRsi > penultimoEmaRsi;
      } else {
        return false;
      }
    };

    this.ultimaVela = (interval) => {
      /*  console.log(
        "interval",
        interval,
        "this.velas15m",
        this.velas15m.slice(-1)[0]
      );*/
      switch (interval) {
        case "15m": {
          //console.log("Ultima vela 15m: ", this.velas15m.slice(-1)[0]);

          return this.velas15m.slice(-1)[0];
        }
        case "1h": {
          return this.velas1h.slice(-1)[0];
        }
        default: {
          console.error(
            `No se pudo obtener la última vela porque no encontre ${interval}.`
          );
          return false; // O maneja el error según tu lógica
        }
      }
    };

    this.isUltimaVelaVerde = (ultimaVelaObj) => {
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
        switch (idNameFuncion) {
          case "ema8_ema26_rsi15m": {
            const calcularDatosCompra = async () => {
              const ultimaVela = this.ultimaVela("15m");

              const inversionUsdt = 20; //await balances.balance("USDT");
              const perdidaMaxima = inversionUsdt * 0.02;
              const stopLoss = parseFloat(ultimaVela.low);
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

            /* console.log(
              "VIENDO LOS DATOS DE LA COMPRA: ",
              "PERDIDA MAXIMA",
              perdidaMaxima,
              "stopLoss",
              stopLoss,
              "btc",
              btc,
              "compra",
              compra,
              "usdt",
              usdt
            );*/
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
                  qty: "0.001",
                  commission: "0.00000005",
                  commissionAsset: "BTC",
                  tradeId: 987654321,
                },
              ],
            };

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
                  totalBtc: compra,
                  totalUsdt: usdt,
                  compraHasCruceAlcista: this.hasCruceAlcista(idNameFuncion),
                  compraUltimaVela: this.ultimaVela("15m"),
                  compraEMA20_15m: this.EMA20_15m.at(-1),
                  compraEMA8_RSI_15m: this.EMA8_RSI_15m,
                  compraEMA26_RSI_15m: this.EMA26_RSI_15m,
                  compraRSI14_15m: this.RSI14_15m.at(-1),
                  compraIs_RSI_Alcista: this.is_RSI_Alcista("15m"),
                },
                informacionMercado: {
                  stopLoss: stopLoss,
                  perdidaMaxima: perdidaMaxima,
                  SR_4h: SR_4h,
                },
                candLesticksCompra: {
                  velaCompra: this.ultimaVela("15m"),
                  data15m: this.data15m,
                  data4h: this.data4h,
                },
                binanceOrdenData: orden,
              };
              // console.log("DATA DE RETORNO DE LA COMPRA: ", data);
              return data;
            }
          }
          case "ema8_ema26_rsi1h": {
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

            /* console.log(
              "VIENDO LOS DATOS DE LA COMPRA: ",
              "PERDIDA MAXIMA",
              perdidaMaxima,
              "stopLoss",
              stopLoss,
              "btc",
              btc,
              "compra",
              compra,
              "usdt",
              usdt
            );*/
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
                  qty: "0.001",
                  commission: "0.00000005",
                  commissionAsset: "BTC",
                  tradeId: 987654321,
                },
              ],
            };

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
              // console.log("DATA DE RETORNO DE LA COMPRA: ", data);

              // Log para indicadores de venta en 1h
              /* console.log("indicadores:", "INDICADORES COMPRA");
              console.log(convertToBerlinTime(this.ultimaVela("1h").closeTime));
              console.log("Última Vela 1h:");
              console.log("UltimaVela:", this.ultimaVela("1h"));

              console.log("EMA y RSI en 1h:");
              console.log("EMA20_1h:", this.EMA20_1h.at(-1));
              console.log("EMA8_RSI_1h:", this.EMA8_RSI_1h);
              console.log("EMA26_RSI_1h:", this.EMA26_RSI_1h);
              console.log("RSI14_1h:", this.RSI14_1h.at(-1));

              console.log("RSI Alcista en 1h:");
              console.log("is_RSI_Alcista:", this.is_RSI_Alcista("1h"));
              // Log para soportes y resistencias de 1h
              console.log("1H Soportes y Resistencias:");
              console.log(
                "sopRes1h:",
                "Compra Soportes y resistencias en velas de 1h"
              );
              console.log("r2_1h:", this.r2_1h);
              console.log("r1_1h:", this.r1_1h);
              console.log("pp_1h:", this.pp_1h);
              console.log("s1_1h:", this.s1_1h);
              console.log("s2_1h:", this.s2_1h);

              console.log("Resistencia y Soporte Actual 1H:");
              console.log("resistenciaActual_1h:", this.resistenciaActual_1h);
              console.log("soporteActual_1h:", this.soporteActual_1h);

              console.log("Zonas de Soportes y Resistencias 1H:");
              console.log("isZona1_1h:", this.isZona1_1h);
              console.log("isZona2_1h:", this.isZona2_1h);
              console.log("isZona3_1h:", this.isZona3_1h);
              console.log("isZona4_1h:", this.isZona4_1h);

              console.log("Resistencias por Zonas 1H:");
              console.log("resistenciaZona1_1h:", this.resistenciaZona1_1h);
              console.log("resistenciaZona2_1h:", this.resistenciaZona2_1h);
              console.log("resistenciaZona3_1h:", this.resistenciaZona3_1h);
              console.log("resistenciaZona4_1h:", this.resistenciaZona4_1h);

              // Log para soportes y resistencias de 4h
              console.log("4H Soportes y Resistencias:");
              console.log(
                "sopRes4h:",
                "cOMPRA Soportes y resistencias en velas de 4h"
              );
              console.log("r2_4h:", this.r2_4h);
              console.log("r1_4h:", this.r1_4h);
              console.log("pp_4h:", this.pp_4h);
              console.log("s1_4h:", this.s1_4h);
              console.log("s2_4h:", this.s2_4h);

              console.log("Resistencia y Soporte Actual 4H:");
              console.log("resistenciaActual_4h:", this.resistenciaActual_4h);
              console.log("soporteActual_4h:", this.soporteActual_4h);

              console.log("Zonas de Soportes y Resistencias 4H:");
              console.log("isZona1_4h:", this.isZona1_4h);
              console.log("isZona2_4h:", this.isZona2_4h);
              console.log("isZona3_4h:", this.isZona3_4h);
              console.log("isZona4_4h:", this.isZona4_4h);

              console.log("Resistencias por Zonas 4H:");
              console.log("resistenciaZona1_4h:", this.resistenciaZona1_4h);
              console.log("resistenciaZona2_4h:", this.resistenciaZona2_4h);
              console.log("resistenciaZona3_4h:", this.resistenciaZona3_4h);
              console.log("resistenciaZona4_4h:", this.resistenciaZona4_4h);
              console.log(">");*/

              return data;
            }
          }
          default:
            console.error(`Id de función desconocido: ${idNameFuncion}`);
            return false;
        }
      } catch (error) {
        console.log("Error en this.compra: ", error.message);
      }
    };

    this.vende = async (idNameFuncion) => {
      const { informacion, candLesticksCompra, metricas, binanceOrdenData } =
        this.encontrarOrden(idNameFuncion);

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
            qty: "0.001",
            commission: "0.00000005",
            commissionAsset: "BTC",
            tradeId: 987654321,
          },
        ],
      };

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
          /* indicadoresCompra: "INDICADORES COMPRA",
          compraUltimaVela,
          compraHasCruceAlcista,
          compraEMA20_15m,
          compraEMA8_RSI_15m,
          compraEMA26_RSI_15m,
          compraRSI14_15m,
          compraIs_RSI_Alcista,*/
          /* compraSopRes1h: "Compra Soportes y resistencias en velas de 1h",
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
          compraSopRes4h: "Compra Soportes y resistencias en velas de 4h",
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
          indicadoresVenta: "INDICADORES",
          ventaUltimaVela: this.ultimaVela("1h"),
          ventaEMA20_1h: this.EMA20_1h.at(-1),
          ventaEMA8_RSI_1h: this.EMA8_RSI_1h,
          ventaEMA26_RSI_1h: this.EMA26_RSI_1h,
          ventaRSI14_1h: this.RSI14_1h.at(-1),
          ventais_RSI_Alcista: this.is_RSI_Alcista("1h"),*/
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

      // Log para indicadores de venta en 1h
      /* console.log("indicadores:", "INDICADORES VENTA");

      console.log(convertToBerlinTime(this.ultimaVela("1h").closeTime));

      console.log("Última Vela 1h:");
      console.log("ventaUltimaVela:", this.ultimaVela("1h"));

      console.log("EMA y RSI en 1h:");
      console.log("ventaEMA20_1h:", this.EMA20_1h.at(-1));
      console.log("ventaEMA8_RSI_1h:", this.EMA8_RSI_1h);
      console.log("ventaEMA26_RSI_1h:", this.EMA26_RSI_1h);
      console.log("ventaRSI14_1h:", this.RSI14_1h.at(-1));

      console.log("RSI Alcista en 1h:");
      console.log("ventais_RSI_Alcista:", this.is_RSI_Alcista("1h"));

      // Log para soportes y resistencias de 1h
      console.log("1H Soportes y Resistencias: VENTA ");
      console.log("sopRes1h:", "Venta Soportes y resistencias en velas de 1h");
      console.log("r2_1h:", this.r2_1h);
      console.log("r1_1h:", this.r1_1h);
      console.log("pp_1h:", this.pp_1h);
      console.log("s1_1h:", this.s1_1h);
      console.log("s2_1h:", this.s2_1h);

      console.log("Resistencia y Soporte Actual 1H:");
      console.log("resistenciaActual_1h:", this.resistenciaActual_1h);
      console.log("soporteActual_1h:", this.soporteActual_1h);

      console.log("Zonas de Soportes y Resistencias 1H:");
      console.log("isZona1_1h:", this.isZona1_1h);
      console.log("isZona2_1h:", this.isZona2_1h);
      console.log("isZona3_1h:", this.isZona3_1h);
      console.log("isZona4_1h:", this.isZona4_1h);

      console.log("Resistencias por Zonas 1H:");
      console.log("resistenciaZona1_1h:", this.resistenciaZona1_1h);
      console.log("resistenciaZona2_1h:", this.resistenciaZona2_1h);
      console.log("resistenciaZona3_1h:", this.resistenciaZona3_1h);
      console.log("resistenciaZona4_1h:", this.resistenciaZona4_1h);

      // Log para soportes y resistencias de 4h
      console.log("4H Soportes y Resistencias:");
      console.log("sopRes4h:", "Venta Soportes y resistencias en velas de 4h");
      console.log("r2_4h:", this.r2_4h);
      console.log("r1_4h:", this.r1_4h);
      console.log("pp_4h:", this.pp_4h);
      console.log("s1_4h:", this.s1_4h);
      console.log("s2_4h:", this.s2_4h);

      console.log("Resistencia y Soporte Actual 4H:");
      console.log("resistenciaActual_4h:", this.resistenciaActual_4h);
      console.log("soporteActual_4h:", this.soporteActual_4h);

      console.log("Zonas de Soportes y Resistencias 4H:");
      console.log("isZona1_4h:", this.isZona1_4h);
      console.log("isZona2_4h:", this.isZona2_4h);
      console.log("isZona3_4h:", this.isZona3_4h);
      console.log("isZona4_4h:", this.isZona4_4h);

      console.log("Resistencias por Zonas 4H:");
      console.log("resistenciaZona1_4h:", this.resistenciaZona1_4h);
      console.log("resistenciaZona2_4h:", this.resistenciaZona2_4h);
      console.log("resistenciaZona3_4h:", this.resistenciaZona3_4h);
      console.log("resistenciaZona4_4h:", this.resistenciaZona4_4h);
      console.log(">");*/

      return data;
    };
  }

  ema8_ema26_rsi = async (interval, buySell) => {
    try {
      /* if (!this.RSI14_1h || this.RSI14_1h.length === 0) {
        throw new Error("RSI14_1h no está definido o está vacío.");
      }

      if (!this.EMA20_1h || this.EMA20_1h.length === 0) {
        throw new Error("EMA20_1h no está definido o está vacío.");
      }*/
      // console.log("RSI14_1h: ", this.RSI14_1h);
      // console.log("EMA20_1h: ", this.EMA20_1h);
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
          /* console.log("indicadores:", "INDICADORES COMPRA");
            console.log(convertToBerlinTime(this.ultimaVela("1h").closeTime));
            console.log("Última Vela 1h:");
            console.log("UltimaVela:", this.ultimaVela("1h"));

            console.log("precio", this.price);

            console.log("EMA y RSI en 1h:");
            console.log("EMA20_1h:", this.EMA20_1h.at(-1));
            console.log("EMA8_RSI_1h:", this.EMA8_RSI_1h);
            console.log("EMA26_RSI_1h:", this.EMA26_RSI_1h);
            console.log("RSI14_1h:", this.RSI14_1h.at(-1));

            console.log("RSI Alcista en 1h:");
            console.log("is_RSI_Alcista:", this.is_RSI_Alcista("1h"));
            console.log(
              "hasCruceAlcista:",
              this.hasCruceAlcista(idNameFuncion)
            );*/
          // Log para soportes y resistencias de 1h
          /*  console.log("1H Soportes y Resistencias:");
            console.log(
              "sopRes1h:",
              "Compra Soportes y resistencias en velas de 1h"
            );
            console.log("r2_1h:", this.r2_1h);
            console.log("r1_1h:", this.r1_1h);
            console.log("pp_1h:", this.pp_1h);
            console.log("s1_1h:", this.s1_1h);
            console.log("s2_1h:", this.s2_1h);

            console.log("Resistencia y Soporte Actual 1H:");
            console.log("resistenciaActual_1h:", this.resistenciaActual_1h);
            console.log("soporteActual_1h:", this.soporteActual_1h);

            console.log("Zonas de Soportes y Resistencias 1H:");
            console.log("isZona1_1h:", this.isZona1_1h);
            console.log("isZona2_1h:", this.isZona2_1h);
            console.log("isZona3_1h:", this.isZona3_1h);
            console.log("isZona4_1h:", this.isZona4_1h);

            console.log("Resistencias por Zonas 1H:");
            console.log("resistenciaZona1_1h:", this.resistenciaZona1_1h);
            console.log("resistenciaZona2_1h:", this.resistenciaZona2_1h);
            console.log("resistenciaZona3_1h:", this.resistenciaZona3_1h);
            console.log("resistenciaZona4_1h:", this.resistenciaZona4_1h);

            // Log para soportes y resistencias de 4h
            console.log("4H Soportes y Resistencias:");
            console.log(
              "sopRes4h:",
              "cOMPRA Soportes y resistencias en velas de 4h"
            );
            console.log("r2_4h:", this.r2_4h);
            console.log("r1_4h:", this.r1_4h);
            console.log("pp_4h:", this.pp_4h);
            console.log("s1_4h:", this.s1_4h);
            console.log("s2_4h:", this.s2_4h);

            console.log("Resistencia y Soporte Actual 4H:");
            console.log("resistenciaActual_4h:", this.resistenciaActual_4h);
            console.log("soporteActual_4h:", this.soporteActual_4h);*/
          /* console.log("Zonas de Soportes y Resistencias 4H:");
            console.log("isZona1_4h:", this.isZona1_4h);
            console.log("isZona2_4h:", this.isZona2_4h);
            console.log("isZona3_4h:", this.isZona3_4h);
            console.log("isZona4_4h:", this.isZona4_4h);*/
          /* console.log("Resistencias por Zonas 4H:");
            console.log("resistenciaZona1_4h:", this.resistenciaZona1_4h);
            console.log("resistenciaZona2_4h:", this.resistenciaZona2_4h);
            console.log("resistenciaZona3_4h:", this.resistenciaZona3_4h);
            console.log("resistenciaZona4_4h:", this.resistenciaZona4_4h);
            console.log(">");*/

          // console.log("DATA DE RETORNO DE LA COMPRA: ", data);

          // Log para indicadores de venta en 1h

          if (this.hasCruceAlcista(idNameFuncion)) {
            // console.log("is_RSI_Alcista:", this.is_RSI_Alcista("1h"));
            if (
              this.is_RSI_Alcista(interval) &&
              EMA8_RSI >= 50 &&
              EMA8_RSI <= 65
            ) {
              if (
                this.isUltimaVelaVerde(ultimaVela) &&
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
        //console.log("IF #1 superado");
        /*if (this.hasCruceAlcista(idNameFuncion)) {
            console.log(
              `this.hasCruceAlcista("ema8-ema26-rsi")`,
              this.hasCruceAlcista(idNameFuncion)
            );
            console.log(`this.RSI14_15m.at(-1)`, this.RSI14_15m.at(-1));
            console.log(
              `this.is_RSI_Alcista(interval)`,
              this.is_RSI_Alcista(interval)
            );
          }*/
        /*  console.log(
                "IF #2 superado",
                this.RSI14_15m.at(-1) > 50 && this.is_RSI_Alcista(interval)
              );*/

        /*console.log("Ultima Vela: ", ultimaVela);
            console.log("this.EMA20_15m.at(-1): ", this.EMA20_15m.at(-1));

            console.log(
              "this.isUltimaVelaVerde(ultimaVela)",
              this.isUltimaVelaVerde(ultimaVela)
            );
            console.log(
              "Cerro por encima de la ema",
              parseFloat(ultimaVela.close) > this.EMA20_15m.at(-1)
            );*/
        /* console.log(
                  "Fecha: ",
                  convertToBerlinTime(this.ultimaVela("15m").closeTime)
                );*/

        // console.log("Datos de Compra", data);
      } else if (buySell === "sell") {
        /*  const myOperacion = this.comprasArr.find(
          (operacion) => operacion.informacion.id === idNameFuncion
        );*/
        /* console.log(
          "Esto devuelvo en : this.encontrarOrden(idNameFuncion)",
          this.encontrarOrden(idNameFuncion)
        );
*/
        const myOperacion = this.encontrarOrden(idNameFuncion);
        const { stopLoss } = myOperacion.metricas; // momento de la compra

        if (this.price < stopLoss) {
          this.isStopLoss = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }

        /* if (this.RSI14_1h.at(-1) >= 75 || this.price >= resistenciaActual_1h) {
          if (this.RSI14_1h.at(-1) >= 75) {
            this.ventaRsi75 = true;
          } else if (this.price >= resistenciaActual_1h) {
            this.resistenciaActualAlcanzada = true;
          }
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }*/

        /* if (this.price >= resistenciaZona4_4h) {
          this.ventaResistenciaZona3 = true;
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }
        if (this.price >= this.r2_4h) {
          const data = await this.vende(idNameFuncion);
          if (data) {
            return data;
          }
        }*/

        if (EMA8_RSI < EMA26_RSI && !this.is_RSI_Alcista(interval)) {
          if (
            !this.isUltimaVelaVerde(ultimaVela) &&
            parseFloat(ultimaVela.close) < EMA20
          ) {
            const data = await this.vende(idNameFuncion);
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

const getVelasData = async (symbol, interval) => {
  const velas = await client.candles({
    symbol: symbol,
    interval: interval,
  });
  return velas;
};

//const endTime = //Actualizar con la ultima fecha

const backtesting = async () => {
  const prices = await client.prices().then((prices) => {
    const listaPrecios = {
      BTCUSDT: parseFloat(parseFloat(prices.BTCUSDT).toFixed(2)),
      ETHUSDT: parseFloat(parseFloat(prices.ETHUSDT).toFixed(2)),
    };

    return listaPrecios;
  });
  console.log("prices", prices);

  const data1mArr = await getVelasData(symbol, "1m");

  const data5mArr = await getVelasData(symbol, "5m");

  const data15mArr = await getVelasData(symbol, "15m");

  const data30mArr = await getVelasData(symbol, "30m");

  const data1hmArr = await getVelasData(symbol, "1h");

  const data4hArr = await getVelasData(symbol, "4h");

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

  // Busca compra
  if (myData.compras.length < 1) {
    //  console.log("myData.compras.length:", myData.compras.length);

    //  console.log("Voy a buscar una compra");
    //  console.log("Estrategias instance:", estrategias);
    const buy = await estrategias.ema8_ema26_rsi(temporalidad, "buy");

    if (buy) {
      console.log("HE COMPRADO");
      //  console.log("Datos de la compra: ", buy);

      //  console.log(buy);
      myData.compras.push(buy);
    }
  } else {
    //   console.log("NO ENCONTRE UNA COMPRA");
  }

  // Busca Venta
  if (myData.compras.length >= 1) {
    //console.log("BUSCANDO VENTA, MI LISTA ES DE: ", myData.compras.length);

    for (let i = 0; i < myData.compras.length; i++) {
      //    console.log("ESTOY DENTRO DE FOR DE LA LISTA DE COMPRAS");
      if (myData.compras[i].informacion.id === "ema8_ema26_rsi1h") {
        //    console.log("ENCONTRE UN ID LLAMADO EMA-RSI-15M");

        const sell = await estrategias.ema8_ema26_rsi(temporalidad, "sell");

        if (sell) {
          console.log("sell FUE EXITOSA: ", sell);

          if (sell.informacion.status === "finalizado") {
            // ELIMINO
            const ventaId = sell.compra.binanceOrdenData.orderId;
            const nuevoArr = myData.compras.filter(
              (item) => item.binanceOrdenData.orderId !== ventaId
            );
            myData.compras = nuevoArr;
            /* console.log(
                    "ESTO TIENE EL ARR DE COMPRAS DESPUES DE ELIMINAR LA OPERACION",
                    myData.compras
                  );*/

            console.log("Resultado: ", sell.resultado);
            console.log(">>>>>>>>>>");
            console.log(">>>>>>>>>>");
            console.log(">>>>>>>>>>");

            myData.historial.push(sell);
            /*console.log(
                    "EL PUSH FUE EXITOSO? ESTE ES THIS.HISTORIALoPERACIONES",
                    this.historialOperaciones
                  );*/
          }
        }
      }
    }
  }
};
backtesting();
/*(async () => {
  const resultado = await backtesting(
    new Date("2023-01-01T00:00:00.000Z").getTime(),
    new Date("2024-12-31T00:00:00.000Z").getTime()
  );
  console.log(resultado);
})();*/

/*    new Date("2024-10-24T00:00:00.000Z").getTime(),
    new Date("2024-11-06T00:00:00.000Z").getTime()
     */
