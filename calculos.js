/**
 * Módulo Matemático: Cálculo de integrales numéricas mediante Regla del Trapecio Compuesto
 * Implementación según especificaciones de plan.md para la asignatura Métodos Numéricos.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Entorno Node.js / CommonJS
    module.exports = factory();
  } else {
    // Entorno de Navegador
    root.Calculos = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Función de tasa de transferencia R(t) en Mbps.
   * R(t) = 10 + 5*sin(pi*t / 4) + exp(0.15*t)
   * @param {number} t Tiempo en segundos
   * @returns {number} Tasa instantánea de transferencia en Mbps
   */
  function tasaTransferencia(t) {
    return 10 + 5 * Math.sin((Math.PI * t) / 4) + Math.exp(0.15 * t);
  }

  /**
   * Regla del Trapecio Compuesto para aproximar la integral definida de f en [a, b].
   * Fórmula: T_n = (h / 2) * [ f(a) + 2 * sum_{i=1}^{n-1} f(a + i*h) + f(b) ]
   * donde h = (b - a) / n
   *
   * @param {Function} f Función matemática continua a integrar
   * @param {number} a Límite inferior de integración
   * @param {number} b Límite superior de integración
   * @param {number} n Número de subintervalos (entero positivo)
   * @returns {number} Valor numérico de la integral aproximada
   */
  function trapecio_compuesto(f, a, b, n) {
    if (typeof f !== 'function') {
      throw new TypeError('El argumento f debe ser una función.');
    }
    if (!Number.isInteger(n) || n <= 0) {
      throw new RangeError('n debe ser un entero positivo mayor que cero.');
    }
    if (b <= a) {
      throw new RangeError('El límite superior b debe ser mayor que el límite inferior a.');
    }

    const h = (b - a) / n;
    let sumaInterior = 0;

    for (let i = 1; i < n; i++) {
      const xi = a + i * h;
      sumaInterior += f(xi);
    }

    const total = (h / 2) * (f(a) + 2 * sumaInterior + f(b));
    return total;
  }

  /**
   * Genera los nodos de evaluación (t_i, R(t_i), pesos y contribuciones)
   * @param {Function} f Función matemática
   * @param {number} a Extremo inferior
   * @param {number} b Extremo superior
   * @param {number} n Cantidad de subintervalos
   * @returns {Array<{i: number, t: number, valor: number, peso: number, contribucion: number}>}
   */
  function generarNodos(f, a, b, n) {
    const h = (b - a) / n;
    const nodos = [];

    for (let i = 0; i <= n; i++) {
      const ti = a + i * h;
      const valor = f(ti);
      const peso = (i === 0 || i === n) ? 1 : 2;
      const contribucion = peso * valor;

      nodos.push({
        i,
        t: ti,
        valor,
        peso,
        contribucion
      });
    }

    return nodos;
  }

  /**
   * Calcula el valor analítico exacto de la integral definida de R(t) en [0, 12]:
   * D_ref = int_0^12 [ 10 + 5*sin(pi*t/4) + exp(0.15*t) ] dt
   *       = 120 + 40/pi + (exp(1.8) - 1)/0.15
   *       approx 166.396711876771 Mb
   * @returns {number} Valor analítico de referencia
   */
  function integralReferencia() {
    return 120 + (40 / Math.PI) + (Math.exp(1.8) - 1) / 0.15;
  }

  /**
   * Calcula el error absoluto real y el porcentaje de error relativo.
   * E_abs = |D_ref - T_n|
   * E_%   = (|D_ref - T_n| / |D_ref|) * 100
   * @param {number} aproximacion Valor obtenido por trapecio compuesto
   * @param {number} referencia Valor analítico exacto
   * @returns {{errorAbsoluto: number, errorPorcentual: number}}
   */
  function calcularErrores(aproximacion, referencia) {
    const errorAbsoluto = Math.abs(referencia - aproximacion);
    const errorPorcentual = (errorAbsoluto / Math.abs(referencia)) * 100;

    return {
      errorAbsoluto,
      errorPorcentual
    };
  }

  /**
   * Construye el análisis de convergencia comparativa para los valores exigidos de n.
   * Por defecto: n in {4, 10, 50, 100, 1000}
   * @param {Function} f Función a integrar
   * @param {number} a Límite inferior (0)
   * @param {number} b Límite superior (12)
   * @param {number[]} valoresN Array de valores de n
   * @param {number} [referencia] Valor de referencia analítico
   * @returns {Array<{n: number, h: number, aproximacion: number, errorAbsoluto: number, errorPorcentual: number}>}
   */
  function generarConvergencia(f, a, b, valoresN = [4, 10, 50, 100, 1000], referencia = integralReferencia()) {
    return valoresN.map(function (n) {
      const h = (b - a) / n;
      const aproximacion = trapecio_compuesto(f, a, b, n);
      const errores = calcularErrores(aproximacion, referencia);

      return {
        n,
        h,
        aproximacion,
        errorAbsoluto: errores.errorAbsoluto,
        errorPorcentual: errores.errorPorcentual
      };
    });
  }

  /**
   * Valida estrictamente la entrada del usuario para el parámetro n.
   * Requisitos:
   * - No vacío ni solo espacios
   * - Solo dígitos enteros (rechaza decimales como 4.5 o notaciones científicas no deseadas)
   * - Rango: 1 <= n <= 100000
   * @param {string|number} entrada Valor a validar
   * @returns {{valido: boolean, n: number|null, errorMsg: string}}
   */
  function validarN(entrada) {
    if (entrada === null || entrada === undefined) {
      return { valido: false, n: null, errorMsg: 'Ingresa un número entero entre 1 y 100000.' };
    }

    const str = String(entrada).trim();
    if (str === '') {
      return { valido: false, n: null, errorMsg: 'El campo no puede estar vacío.' };
    }

    // Comprobar estrictamente si contiene caracteres no numéricos o puntos decimales
    if (!/^\d+$/.test(str)) {
      if (str.includes('.') || str.includes(',')) {
        return { valido: false, n: null, errorMsg: 'No se permiten números decimales. Ingresa un entero.' };
      }
      return { valido: false, n: null, errorMsg: 'Ingresa un número entero válido (solo dígitos).' };
    }

    const n = Number(str);
    if (!Number.isInteger(n)) {
      return { valido: false, n: null, errorMsg: 'Ingresa un número entero entre 1 y 100000.' };
    }

    if (n < 1) {
      return { valido: false, n: null, errorMsg: 'El número de subintervalos debe ser al menos 1.' };
    }

    if (n > 100000) {
      return { valido: false, n: null, errorMsg: 'El valor máximo permitido para la interfaz es 100000.' };
    }

    return { valido: true, n, errorMsg: '' };
  }

  return {
    tasaTransferencia,
    trapecio_compuesto,
    generarNodos,
    integralReferencia,
    calcularErrores,
    generarConvergencia,
    validarN
  };
});
