"""
Módulo de Cálculo e Implementación en Python: Regla del Trapecio Compuesto
Asignatura: Métodos Numéricos

Parte 2: Implementación de Software
- Función trapecio_compuesto(f, a, b, n)
- Análisis de convergencia para n in {4, 10, 50, 100, 1000}
"""

import math

def tasa_transferencia(t: float) -> float:
    """
    Función de tasa de transferencia R(t) en Mbps.
    R(t) = 10 + 5*sin(pi*t / 4) + exp(0.15*t)
    """
    return 10.0 + 5.0 * math.sin(math.pi * t / 4.0) + math.exp(0.15 * t)

def trapecio_compuesto(f, a: float, b: float, n: int) -> float:
    """
    Calcula de forma automatizada la integral definida de f en [a, b]
    utilizando la Regla del Trapecio Compuesto con n subintervalos.
    
    Parámetros:
      f: función continua a integrar
      a: límite inferior de integración
      b: límite superior de integración
      n: número de subintervalos (entero positivo)
      
    Retorna:
      Valor aproximado de la integral definida.
    """
    if not isinstance(n, int) or n <= 0:
        raise ValueError("n debe ser un número entero positivo.")
    if b <= a:
        raise ValueError("El límite superior b debe ser mayor que el límite inferior a.")
        
    h = (b - a) / n
    suma_interior = sum(f(a + i * h) for i in range(1, n))
    resultado = (h / 2.0) * (f(a) + 2.0 * suma_interior + f(b))
    return resultado

def integral_referencia() -> float:
    """
    Calcula el valor analítico exacto de la integral en [0, 12]:
    D_ref = 120 + 40/pi + (exp(1.8) - 1)/0.15 approx 166.396711876771 Mb
    """
    return 120.0 + (40.0 / math.pi) + (math.exp(1.8) - 1.0) / 0.15

def calcular_errores(aproximacion: float, referencia: float):
    """Calcula error absoluto real y porcentaje de error relativo."""
    error_abs = abs(referencia - aproximacion)
    error_pct = (error_abs / abs(referencia)) * 100.0
    return error_abs, error_pct

def ejecutar_analisis_convergencia():
    """Genera y muestra la tabla comparativa solicitada en la actividad."""
    a, b = 0.0, 12.0
    valores_n = [4, 10, 50, 100, 1000]
    ref = integral_referencia()

    print("=" * 80)
    print(" ANÁLISIS DE CONVERGENCIA - MÉTODO DEL TRAPECIO COMPUESTO")
    print(" R(t) = 10 + 5*sin(pi*t/4) + exp(0.15*t)  en  t in [0, 12] s")
    print(f" Valor Analítico de Referencia: D_ref = {ref:.6f} Mb")
    print("=" * 80)
    print(f"{'n':>6} | {'h (s)':>8} | {'Estimación (Mb)':>16} | {'Error Absoluto (Mb)':>20} | {'Error (%)':>12}")
    print("-" * 80)

    for n in valores_n:
        h = (b - a) / n
        aprox = trapecio_compuesto(tasa_transferencia, a, b, n)
        err_abs, err_pct = calcular_errores(aprox, ref)
        print(f"{n:>6} | {h:>8.4f} | {aprox:>16.6f} | {err_abs:>20.6f} | {err_pct:>11.6f}%")

    print("=" * 80)
    print("Conclusión: Al incrementar n, el paso h disminuye y el error decae con orden O(h^2).")

if __name__ == "__main__":
    ejecutar_analisis_convergencia()
