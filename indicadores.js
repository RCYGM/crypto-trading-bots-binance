class Indicadores {
  constructor() {
    // El constructor ahora no necesita manejar un array de precios.
  }

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
    if (!Array.isArray(preciosArr) || preciosArr.length < periodos) {
      throw new Error(
        "Debes proporcionar un array válido con suficientes datos."
      );
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
    return ema[ema.length - 1];
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
    return rsi[rsi.length - 1];
  }

  calculateSopRes(maximo, minimo, cierre) {
    if (maximo.length !== minimo.length || maximo.length !== cierre.length) {
      throw new Error(
        "Los arrays maximo, minimo y cierre deben tener la misma longitud."
      );
    }

    if (
      !maximo.every((val) => typeof val === "number") ||
      !minimo.every((val) => typeof val === "number") ||
      !cierre.every((val) => typeof val === "number")
    ) {
      throw new Error("Todos los elementos de los arrays deben ser números.");
    }

    // Calcular PP
    const pp =
      (maximo.reduce((a, b) => a + b, 0) +
        minimo.reduce((a, b) => a + b, 0) +
        cierre.reduce((a, b) => a + b, 0)) /
      (3 * maximo.length);

    // Calcular R1, S1, R2, S2
    const r1 = 2 * pp - Math.min(...minimo);
    const s1 = 2 * pp - Math.max(...maximo);
    const r2 = pp + (Math.max(...maximo) - Math.min(...minimo));
    const s2 = pp - (Math.max(...maximo) - Math.min(...minimo));

    return { pp, r1, s1, r2, s2 };
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
