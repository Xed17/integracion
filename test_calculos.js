/**
 * Tests para el módulo matemático calculos.js
 * Basado en las pruebas especificadas en la Sección 7 de plan.md
 */

const {
  tasaTransferencia,
  trapecio_compuesto,
  generarNodos,
  integralReferencia,
  calcularErrores,
  generarConvergencia,
  validarN
} = require('./calculos.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

function assertClose(actual, expected, tol = 1e-6, message = '') {
  const diff = Math.abs(actual - expected);
  const ok = diff <= tol;
  assert(ok, `${message} (Obtenido: ${actual}, Esperado: ${expected}, Dif: ${diff})`);
}

console.log('--- Iniciando Pruebas Matemáticas ---');

// 1. Constante f(t) = 5 en [0, 12] -> Integral debe ser 60 para cualquier n
const fConst = () => 5;
for (const n of [1, 4, 10, 50]) {
  assertClose(trapecio_compuesto(fConst, 0, 12, n), 60, 1e-9, `f(t)=5 en [0,12] con n=${n} da 60`);
}

// 2. Lineal f(t) = t en [0, 12] -> Integral debe ser 12^2 / 2 = 72 para cualquier n
const fLineal = t => t;
for (const n of [1, 4, 10, 50]) {
  assertClose(trapecio_compuesto(fLineal, 0, 12, n), 72, 1e-9, `f(t)=t en [0,12] con n=${n} da 72`);
}

// 3. Problema original para n = 4 -> 160.443697...
const ref = integralReferencia();
assertClose(ref, 166.396711876771, 1e-6, 'Referencia analítica D_ref');

const aprox4 = trapecio_compuesto(tasaTransferencia, 0, 12, 4);
assertClose(aprox4, 160.443697114248, 1e-6, 'Aproximación n=4');

const err4 = calcularErrores(aprox4, ref);
assertClose(err4.errorAbsoluto, 5.953015, 1e-6, 'Error absoluto n=4');
assertClose(err4.errorPorcentual, 3.577604, 1e-6, 'Error porcentual n=4');

// 4. Problema original para n = 1000 -> 166.396627...
const aprox1000 = trapecio_compuesto(tasaTransferencia, 0, 12, 1000);
assertClose(aprox1000, 166.396626718217, 1e-6, 'Aproximación n=1000');
const err1000 = calcularErrores(aprox1000, ref);
assertClose(err1000.errorAbsoluto, 0.000085, 1e-6, 'Error absoluto n=1000');
assertClose(err1000.errorPorcentual, 0.000051, 1e-6, 'Error porcentual n=1000');

// 5. Nodos para n = 4 -> 5 nodos, h = 3
const nodos4 = generarNodos(tasaTransferencia, 0, 12, 4);
assert(nodos4.length === 5, 'n=4 genera exactamente 5 nodos');
assert(nodos4[0].t === 0 && nodos4[0].peso === 1, 'Nodo 0: t=0, peso=1');
assertClose(nodos4[0].valor, 11.0, 1e-6, 'Nodo 0: R(0) = 11');
assert(nodos4[1].t === 3 && nodos4[1].peso === 2, 'Nodo 1: t=3, peso=2');
assertClose(nodos4[1].valor, 15.103846, 1e-6, 'Nodo 1: R(3) = 15.103846');
assert(nodos4[2].t === 6 && nodos4[2].peso === 2, 'Nodo 2: t=6, peso=2');
assertClose(nodos4[2].valor, 7.459603, 1e-6, 'Nodo 2: R(6) = 7.459603');
assert(nodos4[3].t === 9 && nodos4[3].peso === 2, 'Nodo 3: t=9, peso=2');
assertClose(nodos4[3].valor, 17.392959, 1e-6, 'Nodo 3: R(9) = 17.392959');
assert(nodos4[4].t === 12 && nodos4[4].peso === 1, 'Nodo 4: t=12, peso=1');
assertClose(nodos4[4].valor, 16.049647, 1e-6, 'Nodo 4: R(12) = 16.049647');

// 6. Tabla de convergencia con n in {4, 10, 50, 100, 1000}
const tabla = generarConvergencia(tasaTransferencia, 0, 12, [4, 10, 50, 100, 1000], ref);
assert(tabla.length === 5, 'Tabla de convergencia tiene 5 filas');
assertClose(tabla[1].aproximacion, 165.530824, 1e-6, 'Fila n=10 aproximación');
assertClose(tabla[1].errorAbsoluto, 0.865888, 1e-6, 'Fila n=10 error absoluto');
assertClose(tabla[1].errorPorcentual, 0.520376, 1e-6, 'Fila n=10 error %');
assertClose(tabla[2].aproximacion, 166.362626, 1e-6, 'Fila n=50 aproximación');
assertClose(tabla[3].aproximacion, 166.388195, 1e-6, 'Fila n=100 aproximación');

console.log('\n--- Pruebas de Validación de n ---');
assert(!validarN('').valido, 'Cadena vacía es inválida');
assert(!validarN('abc').valido, 'Texto es inválido');
assert(!validarN(0).valido, 'Cero es inválido');
assert(!validarN(-5).valido, 'Número negativo es inválido');
assert(!validarN(4.5).valido, 'Decimal 4.5 es inválido');
assert(!validarN('4.5').valido, 'String decimal "4.5" es inválido');
assert(!validarN(100001).valido, 'Valor superior al límite (100001) es inválido');
assert(validarN(4).valido && validarN(4).n === 4, 'Entero 4 es válido');
assert(validarN('100').valido && validarN('100').n === 100, 'String "100" es válido');
assert(validarN(100000).valido, 'Límite máximo 100000 es válido');

console.log(`\nResumen: ${testsPassed} pasaron, ${testsFailed} fallaron.`);
if (testsFailed > 0) {
  process.exit(1);
}
