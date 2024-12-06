class Indicadores {
  constructor() {}

  // Método para calcular el SMA inicial (primer valor para EMA)
  calculateSMA(preciosArr, periodos) {
    if (!Array.isArray(preciosArr) || preciosArr.length < periodos) {
      throw new Error(
        "Debes proporcionar un array válido con suficientes datos."
      );
    }

    // Promedio de los primeros 'N' periodos
    const sum = preciosArr.slice(0, periodos).reduce((a, b) => a + b, 0);
    return sum / periodos;
  }

  // Método para calcular la EMA
  calculateEMA(preciosArr, periodos) {
    if (!Array.isArray(preciosArr)) {
      throw new Error("Debes proporcionar un array válido");
    }
    if (preciosArr.length < periodos) {
      throw new Error("Debes proporcionar un con suficientes datos.");
    }
    if (typeof periodos !== "number" || periodos <= 0) {
      throw new Error("El período debe ser un número mayor que 0.");
    }
    if (
      !preciosArr.every(
        (precio) => typeof precio === "number" && !isNaN(precio)
      )
    ) {
      throw new Error("El array debe contener únicamente números válidos.");
    }
    if (preciosArr.length < periodos + 1) {
      throw new Error(
        `Se necesitan al menos ${
          periodos + 1
        } datos para calcular la EMA. Proporcionaste ${preciosArr.length}.`
      );
    }

    const multiplicador = 2 / (periodos + 1); // Factor de suavizado
    let ema = [];

    // Calcular el SMA inicial como base para la EMA
    const smaInicial = this.calculateSMA(preciosArr, periodos);
    ema.push(smaInicial);

    // Calcular EMA para cada periodo posterior
    for (let i = periodos; i < preciosArr.length; i++) {
      const precioActual = preciosArr[i];
      const emaAnterior = ema[ema.length - 1];
      // console.log("Soy ema [] antes de push", ema);

      // Fórmula de la EMA
      const emaActual =
        (precioActual - emaAnterior) * multiplicador + emaAnterior;
      ema.push(emaActual);
      //console.log("Soy ema despues del push", ema);
      // console.log("soy emaArr >>>>>>>>>>>>>", ema);
    }

    // Devolver el último valor o el array completo
    return ema;
  }

  // Método para calcular el RSI
  calculateRSI(preciosArr, periodos) {
    if (!Array.isArray(preciosArr) || preciosArr.length < periodos) {
      throw new Error(
        "Debes proporcionar un array válido con suficientes datos."
      );
    }
    // Arrays para ganancias y pérdidas
    let ganancias = [];
    let perdidas = [];

    // Calcular cambios de precio (diferencias entre cierres consecutivos)

    for (let i = 1; i < preciosArr.length; i++) {
      const cambio = preciosArr[i] - preciosArr[i - 1];

      if (cambio > 0) {
        ganancias.push(cambio); // Ganancias
        perdidas.push(0); // sin perdidas
      } else {
        ganancias.push(0); // sin ganancias
        perdidas.push(Math.abs(cambio)); // perdidas
      }
    }
    // Calcular el promedio inicial de ganancias y pérdidas
    const avgGananciasInicial = ganancias
      .slice(0, periodos)
      .reduce((a, b) => a + b, 0);
    const avgPerdidasInicial = perdidas
      .slice(0, periodos)
      .reduce((a, b) => a + b, 0);

    let avgGanancias = avgGananciasInicial;
    let avgPerdidas = avgPerdidasInicial;

    // Array para almacenar el RSI

    let rsi = [];

    // Calcular el RSI para cada período posterior

    for (let i = periodos; i < ganancias.length; i++) {
      avgGanancias = (avgGanancias * (periodos - 1) + ganancias[i]) / periodos;
      avgPerdidas = (avgPerdidas * (periodos - 1) + perdidas[i]) / periodos;

      const rs = avgGanancias / avgPerdidas;
      const rsiActual = 100 - 100 / (1 + rs);
      rsi.push(rsiActual);
    }

    // Devolver el último RSI calculado
    return rsi;
  }

  calculateSopRes(preciosArr, precioActual) {
    let r2 = 0;
    let s2 = Infinity; // Inicializa como el valor más alto posible

    for (let i = 0; i < preciosArr.length; i++) {
      if (preciosArr[i] > r2) {
        r2 = preciosArr[i];
      }

      if (preciosArr[i] < s2) {
        s2 = preciosArr[i];
      }
    }

    const pp = (r2 + s2) / 2;
    const r1 = (pp + r2) / 2;
    const s1 = (pp + s2) / 2;
    /*
    console.log(
      "Resistencia Superior",
      r2,
      "Resistencia Inferior",
      r1,
      "PP",
      pp,
      "Soporte Inferior",
      s1,
      "Soporte Superior",
      s2
    );
*/

    const buscarSoporteResistenciaActual = () => {
      let soporteResistenciaActual = {};

      if (precioActual >= r1 && precioActual <= r2) {
        soporteResistenciaActual = {
          resistenciaActual: r2,
          soporteActual: r1,
        };
      }

      if (precioActual >= pp && precioActual <= r1) {
        soporteResistenciaActual = {
          resistenciaActual: r1,
          soporteActual: pp,
        };
      }

      if (precioActual >= s1 && precioActual <= pp) {
        soporteResistenciaActual = {
          resistenciaActual: pp,
          soporteActual: s1,
        };
      }

      if (precioActual >= s2 && precioActual <= s1) {
        soporteResistenciaActual = {
          resistenciaActual: s1,
          soporteActual: s2,
        };
      }

      return soporteResistenciaActual;
    };

    const BuscarZonas = () => {
      let zonas = {};
      let valorZona1 = 0;
      let valorZona2 = 0;
      let valorZona3 = 0;
      let valorZona4 = 0;
      const { resistenciaActual, soporteActual } =
        buscarSoporteResistenciaActual();

      const distanciaTotal = resistenciaActual - soporteActual;
      const valorCadaZona = distanciaTotal / 4;

      valorZona1 = valorCadaZona;
      valorZona2 = valorCadaZona * 2;
      valorZona3 = valorCadaZona * 3;
      valorZona4 = valorCadaZona * 4;

      const isZona1 =
        precioActual >= soporteActual &&
        precioActual <= soporteActual + valorZona1;

      const isZona2 =
        precioActual >= soporteActual + valorZona1 &&
        precioActual <= soporteActual + valorZona2;

      const isZona3 =
        precioActual >= soporteActual + valorZona2 &&
        precioActual <= soporteActual + valorZona3;

      const isZona4 =
        precioActual >= soporteActual + valorZona3 &&
        precioActual <= soporteActual + valorZona4;

      zonas = {
        isZona1,
        isZona2,
        isZona3,
        isZona4,
        valorZonas: {
          valorZona1,
          valorZona2,
          valorZona3,
          valorZona4,
        },
      };

      return zonas;
    };

    const { resistenciaActual, soporteActual } =
      buscarSoporteResistenciaActual();
    const { isZona1, isZona2, isZona3, isZona4, valorZonas } = BuscarZonas();

    return {
      resistenciaActual,
      soporteActual,
      isZona1,
      isZona2,
      isZona3,
      isZona4,
      valorZonas,
      contextoGeneral: { r2, r1, pp, s1, s2 },
    };
  }
  calculateSMA_RSI(rsiArr, periodos) {
    const valoresParaSMA = rsiArr.slice(-periodos);
    const sma = valoresParaSMA.reduce((a, b) => a + b, 0) / periodos;
    return sma;
  }
  calculateEMA_RSI(rsiValues, period) {
    if (rsiValues.length < period) {
      throw new Error(
        "Se necesitan al menos tantos valores de RSI como el período."
      );
    }

    const multiplier = 2 / (period + 1);

    // Calcular EMA inicial (SMA de los primeros `period` valores)
    let ema = rsiValues.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Iterar sobre los valores restantes para calcular la EMA
    for (let i = period; i < rsiValues.length; i++) {
      ema = (rsiValues[i] - ema) * multiplier + ema;
    }

    return ema;
  }
  calculateHasVolumen(ultimasVelas) {
    const ultimasVelasArr = ultimasVelas.map((vela) => parseFloat(vela.volume));

    const hasVolumen3velas =
      ultimasVelasArr[0] < ultimasVelasArr[1] &&
      ultimasVelasArr[1] < ultimasVelasArr[2];
    const hasVolumen5velas =
      ultimasVelasArr[0] < ultimasVelasArr[1] &&
      ultimasVelasArr[1] < ultimasVelasArr[2] &&
      ultimasVelasArr[2] < ultimasVelasArr[3] &&
      ultimasVelasArr[3] < ultimasVelasArr[4];

    return { hasVolumen3velas, hasVolumen5velas };
  }
}
module.exports = Indicadores; // Exportar la Clase

/* Ejemplo de uso 
// Importar la clase
const Indicadores = require('./indicadores');

// Crear una instancia de la clase (solo una vez)
const indicadores = new Indicadores();

// Ejemplo de precios
const preciosCierre1 = [100, 102, 101, 103, 105, 107, 109, 108, 110, 112];
const preciosCierre2 = [110, 112, 114, 116, 118, 120, 122, 124, 126, 128];

// Calcular EMA para el primer array
const ema10_1 = indicadores.calculateEMA(preciosCierre1, 10);
console.log("EMA para preciosCierre1:", ema10_1);

// Calcular EMA para el segundo array
const ema10_2 = indicadores.calculateEMA(preciosCierre2, 10);
console.log("Último valor de EMA para preciosCierre2:", ema10_2);
*/
