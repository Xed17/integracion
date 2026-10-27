/**
 * Capa de Presentación e Interacción: app.js
 * Maneja eventos, validaciones y renderizado con KaTeX según plan.md.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Referencias a elementos del DOM
  const formCalculo = document.getElementById('formCalculo');
  const inputN = document.getElementById('inputN');
  const errorMsg = document.getElementById('errorMsg');
  const warningBanner = document.getElementById('warningBanner');
  
  const calculoIndicadorN = document.getElementById('calculoIndicadorN');
  const valorResultado = document.getElementById('valorResultado');
  const metaPaso = document.getElementById('metaPaso');
  const metaErrorPct = document.getElementById('metaErrorPct');
  const metaErrorAbs = document.getElementById('metaErrorAbs');
  const metaReferencia = document.getElementById('metaReferencia');

  const procPaso = document.getElementById('procPaso');
  const procSustitucion = document.getElementById('procSustitucion');
  const cuerpoTablaNodos = document.getElementById('cuerpoTablaNodos');
  const nodoAclaracion = document.getElementById('nodoAclaracion');

  const cuerpoTablaConvergencia = document.getElementById('cuerpoTablaConvergencia');

  // Constantes del problema
  const A = 0;
  const B = 12;
  const VALORES_N_CONVERGENCIA = [4, 10, 50, 100, 1000];

  // Estado de la aplicación
  let ultimoNValido = 4;
  const refAnalitica = Calculos.integralReferencia();

  /**
   * Renderiza expresiones KaTeX de forma segura con fallback a texto
   */
  function renderKatex(elemento, tex, displayMode = false) {
    if (!elemento) return;
    if (window.katex && typeof window.katex.render === 'function') {
      try {
        window.katex.render(tex, elemento, {
          displayMode: displayMode,
          throwOnError: false
        });
        return;
      } catch (err) {
        console.warn('Error al renderizar KaTeX:', err);
      }
    }
    elemento.textContent = tex;
  }

  /**
   * Renderiza automáticamente todas las expresiones matemáticas delimitadas en el documento
   */
  function autoRenderMath() {
    if (window.renderMathInElement && typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn('Error en auto-render KaTeX:', err);
      }
    }
  }

  /**
   * Formatea números con precisión académica (6 decimales por defecto)
   */
  function formatearNumero(num, decimales = 6) {
    if (typeof num !== 'number' || isNaN(num)) return '-';
    if (num !== 0 && Math.abs(num) < 1e-6) {
      return num.toExponential(4);
    }
    return num.toFixed(decimales);
  }

  /**
   * Construye la tabla de convergencia para n in {4, 10, 50, 100, 1000}
   */
  function renderizarTablaConvergencia(nActivo) {
    const filasConvergencia = Calculos.generarConvergencia(
      Calculos.tasaTransferencia,
      A,
      B,
      VALORES_N_CONVERGENCIA,
      refAnalitica
    );

    cuerpoTablaConvergencia.innerHTML = '';

    filasConvergencia.forEach(function (fila) {
      const tr = document.createElement('tr');
      if (fila.n === nActivo) {
        tr.classList.add('row-active');
      }

      tr.innerHTML = `
        <td class="num-cell"><strong>${fila.n}</strong></td>
        <td class="num-cell">${formatearNumero(fila.h, fila.h < 0.1 ? 4 : 2)}</td>
        <td class="num-cell">${formatearNumero(fila.aproximacion, 6)}</td>
        <td class="num-cell">${formatearNumero(fila.errorAbsoluto, 6)}</td>
        <td class="num-cell">${formatearNumero(fila.errorPorcentual, 6)} %</td>
      `;

      cuerpoTablaConvergencia.appendChild(tr);
    });
  }

  /**
   * Renderiza el procedimiento matemático y la sustitución numérica con KaTeX
   */
  function renderizarProcedimiento(n, h, nodos, aproximacion) {
    // 1. Paso h formateado con KaTeX
    const texPaso = `h = \\frac{b - a}{n} = \\frac{${B} - ${A}}{${n}} = ${formatearNumero(h, 4)}\\text{ s}`;
    renderKatex(procPaso, texPaso, true);

    // 2. Fórmula y Sustitución Numérica formateadas con KaTeX
    const formulaGeneral = `T_{${n}} = \\frac{h}{2} \\left[ R(${A}) + 2 \\sum_{i=1}^{${n - 1}} R(t_i) + R(${B}) \\right]`;
    let texSustitucion = '';

    const hNum = formatearNumero(h, h < 0.01 ? 6 : 4);
    const r0 = formatearNumero(nodos[0].valor, 6);
    const rn = formatearNumero(nodos[n].valor, 6);
    const totalAprox = formatearNumero(aproximacion, 6);

    if (n === 1) {
      texSustitucion = `\\begin{aligned}
        ${formulaGeneral} \\\\[8pt]
        T_1 &= \\frac{${hNum}}{2} \\left[ ${r0} + ${rn} \\right] \\\\[6pt]
        T_1 &\\approx ${totalAprox}\\text{ Mb}
      \\end{aligned}`;
    } else if (n <= 10) {
      const interiores = nodos.slice(1, n).map(nodo => formatearNumero(nodo.valor, 6)).join(' + ');
      
      texSustitucion = `\\begin{aligned}
        ${formulaGeneral} \\\\[8pt]
        T_{${n}} &= \\frac{${hNum}}{2} \\left[ ${r0} + 2 \\left( ${interiores} \\right) + ${rn} \\right] \\\\[6pt]
        T_{${n}} &\\approx ${totalAprox}\\text{ Mb}
      \\end{aligned}`;
    } else {
      const sumaInterior = nodos.slice(1, n).reduce((acc, curr) => acc + curr.valor, 0);
      const sumaInteriorStr = formatearNumero(sumaInterior, 6);

      texSustitucion = `\\begin{aligned}
        ${formulaGeneral} \\\\[8pt]
        T_{${n}} &= \\frac{${hNum}}{2} \\left[ ${r0} + 2 \\cdot (${sumaInteriorStr}) + ${rn} \\right] \\\\[6pt]
        &\\quad \\text{\\small [Condensando la suma de los ${n - 1} términos interiores para legibilidad]} \\\\[4pt]
        T_{${n}} &\\approx ${totalAprox}\\text{ Mb}
      \\end{aligned}`;
    }

    renderKatex(procSustitucion, texSustitucion, true);

    // 3. Tabla de nodos
    cuerpoTablaNodos.innerHTML = '';
    const totalNodos = nodos.length; // n + 1

    if (totalNodos <= 21) { // n <= 20
      nodoAclaracion.style.display = 'none';
      nodos.forEach(nodo => {
        agregarFilaNodo(nodo);
      });
    } else {
      // Resumir: primeros 10 y últimos 5
      nodoAclaracion.style.display = 'block';
      nodoAclaracion.textContent = `Mostrando vista resumida: primeros 10 y últimos 5 nodos. El algoritmo sumó los ${totalNodos} nodos con precisión total.`;

      const primeros = nodos.slice(0, 10);
      const ultimos = nodos.slice(-5);
      const omitidos = totalNodos - 15;

      primeros.forEach(nodo => agregarFilaNodo(nodo));

      // Fila elíptica
      const trElipsis = document.createElement('tr');
      trElipsis.innerHTML = `
        <td class="num-cell" style="text-align:center;">&hellip;</td>
        <td class="num-cell" style="text-align:center;">&hellip;</td>
        <td class="num-cell" style="text-align:center; color: var(--text-muted); font-style: italic;">(${omitidos} nodos intermedios calculados)</td>
        <td class="num-cell" style="text-align:center;">2</td>
        <td class="num-cell" style="text-align:center;">&hellip;</td>
      `;
      cuerpoTablaNodos.appendChild(trElipsis);

      ultimos.forEach(nodo => agregarFilaNodo(nodo));
    }
  }

  function agregarFilaNodo(nodo) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="num-cell">${nodo.i}</td>
      <td class="num-cell">${formatearNumero(nodo.t, 4)}</td>
      <td class="num-cell">${formatearNumero(nodo.valor, 6)}</td>
      <td class="num-cell">${nodo.peso}</td>
      <td class="num-cell">${formatearNumero(nodo.contribucion, 6)}</td>
    `;
    cuerpoTablaNodos.appendChild(tr);
  }

  /**
   * Ejecuta el cálculo completo para un n válido y refresca la vista
   */
  function ejecutarCalculo(n) {
    const h = (B - A) / n;
    const aproximacion = Calculos.trapecio_compuesto(Calculos.tasaTransferencia, A, B, n);
    const errores = Calculos.calcularErrores(aproximacion, refAnalitica);
    const nodos = Calculos.generarNodos(Calculos.tasaTransferencia, A, B, n);

    // Actualizar bloque de resultado principal con KaTeX
    renderKatex(calculoIndicadorN, `\\text{Para } n = ${n}`, false);
    valorResultado.textContent = formatearNumero(aproximacion, 6);
    metaPaso.textContent = `${formatearNumero(h, h < 0.1 ? 4 : 2)} s`;
    metaErrorPct.textContent = `${formatearNumero(errores.errorPorcentual, 6)} %`;
    metaErrorAbs.textContent = `${formatearNumero(errores.errorAbsoluto, 6)} Mb`;
    metaReferencia.textContent = `${formatearNumero(refAnalitica, 6)} Mb`;

    // Actualizar procedimiento con KaTeX
    renderizarProcedimiento(n, h, nodos, aproximacion);

    // Actualizar resaltado de tabla de convergencia
    renderizarTablaConvergencia(n);

    // Guardar último n válido
    ultimoNValido = n;

    // Limpiar alertas de error
    errorMsg.classList.remove('visible');
    errorMsg.textContent = '';
    inputN.classList.remove('input-error');
    warningBanner.classList.remove('visible');

    // Procesar cualquier otra fórmula con auto-render
    autoRenderMath();
  }

  /**
   * Manejador del evento de envío del formulario
   */
  formCalculo.addEventListener('submit', function (event) {
    event.preventDefault();

    const valorInput = inputN.value;
    const validacion = Calculos.validarN(valorInput);

    if (!validacion.valido) {
      // Mostrar error sin borrar silenciosamente el resultado previo
      errorMsg.textContent = validacion.errorMsg;
      errorMsg.classList.add('visible');
      inputN.classList.add('input-error');
      warningBanner.textContent = `Atención: Entrada inválida. El resultado mostrado corresponde al último cálculo válido (n = ${ultimoNValido}).`;
      warningBanner.classList.add('visible');
      inputN.focus();
      return;
    }

    // Entrada válida: procesar
    ejecutarCalculo(validacion.n);
  });

  // Limpiar estilos de error al teclear
  inputN.addEventListener('input', function () {
    if (errorMsg.classList.contains('visible')) {
      errorMsg.classList.remove('visible');
      inputN.classList.remove('input-error');
    }
  });

  // Inicialización: renderizar estáticos y cálculo inicial con n = 4
  renderizarTablaConvergencia(4);
  ejecutarCalculo(4);
  autoRenderMath();
});
