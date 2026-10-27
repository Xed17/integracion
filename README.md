# Estimación de Tráfico de Red mediante la Regla del Trapecio Compuesto

**Asignatura:** Métodos Numéricos  
**Actividad:** Parte 2: Implementación de Software  

---

## 1. Descripción del Problema

Se desea calcular el volumen total de datos transferidos en una red de comunicaciones durante un intervalo de $t \in [0, 12]$ segundos, donde la tasa instantánea de transferencia está modelada por la función:

$$R(t) = 10 + 5\sin\left(\frac{\pi t}{4}\right) + e^{0.15t} \quad \text{[Mbps]}$$

El volumen total transferido $D$ (en Megabits, $\text{Mb}$) corresponde a la integral definida:

$$D = \int_{0}^{12} R(t)\,dt$$

---

## 2. Fundamento Matemático

### 2.1. Regla del Trapecio Compuesto

Para aproximar la integral dividiendo el intervalo $[a, b] = [0, 12]$ en $n$ subintervalos de ancho constante $h$:

$$h = \frac{b - a}{n} = \frac{12 - 0}{n} = \frac{12}{n}$$

La aproximación por el Trapecio Compuesto $T_n$ se calcula mediante:

$$T_n = \frac{h}{2} \left[ R(a) + 2 \sum_{i=1}^{n-1} R(a + i h) + R(b) \right]$$

donde los nodos interiores tienen peso $2$ y los extremos peso $1$.

### 2.2. Valor Analítico Exacto de Referencia

Integrando término a término:

$$\int 10\,dt = 10t$$

$$\int 5\sin\left(\frac{\pi t}{4}\right)\,dt = -\frac{20}{\pi}\cos\left(\frac{\pi t}{4}\right)$$

$$\int e^{0.15t}\,dt = \frac{e^{0.15t}}{0.15}$$

La antiderivada es:

$$F(t) = 10t - \frac{20}{\pi}\cos\left(\frac{\pi t}{4}\right) + \frac{e^{0.15t}}{0.15}$$

Evaluando en los límites $[0, 12]$:

$$F(12) = 120 - \frac{20}{\pi}\cos(3\pi) + \frac{e^{1.8}}{0.15} = 120 + \frac{20}{\pi} + \frac{e^{1.8}}{0.15}$$

$$F(0) = 0 - \frac{20}{\pi}\cos(0) + \frac{1}{0.15} = -\frac{20}{\pi} + \frac{1}{0.15}$$

$$D_{\text{ref}} = F(12) - F(0) = 120 + \frac{40}{\pi} + \frac{e^{1.8} - 1}{0.15} \approx 166.396711876771\ \text{Mb}$$

### 2.3. Cálculo de Errores

* **Error Absoluto Real:**
  $$E_{\text{abs}} = |D_{\text{ref}} - T_n| \quad [\text{Mb}]$$

* **Porcentaje de Error:**
  $$E_{\%} = \frac{E_{\text{abs}}}{|D_{\text{ref}}|} \times 100\ \%$$

---

## 3. Tabla de Convergencia

Resultados obtenidos con el algoritmo para los valores requeridos en la actividad:

| $n$ | $h$ (s) | Estimación $T_n$ (Mb) | Error Absoluto (Mb) | Error (%) |
|---:|---:|---:|---:|---:|
| **4** | 3.0000 | 160.443697 | 5.953015 | 3.577604 % |
| **10** | 1.2000 | 165.530824 | 0.865888 | 0.520376 % |
| **50** | 0.2400 | 166.362626 | 0.034086 | 0.020485 % |
| **100** | 0.1200 | 166.388195 | 0.008517 | 0.005119 % |
| **1000** | 0.0120 | 166.396627 | 0.000085 | 0.000051 % |

> **Conclusión sobre la convergencia:** El error global del método del trapecio compuesto decrece cuadráticamente respecto a $h$ ($\mathcal{O}(h^2)$). Al multiplicar $n$ por 10 (disminuyendo $h$ a la décima parte), el error se reduce aproximadamente por un factor de 100 ($10^2$).

---

## 4. Estructura de Archivos

```text
integracion/
├── index.html         # Interfaz web semántica y responsiva
├── styles.css         # Diseño académico moderno y minimalista
├── calculos.js        # Módulo matemático puro (trapecio, nodos, errores, validación)
├── app.js             # Controlador de eventos del DOM y renderizado dinámico
├── trapecio.py        # Implementación equivalente en Python para ejecución en terminal
├── test_calculos.js   # Suite automatizada de pruebas unitarias (42 tests aprobados)
└── plan.md            # Planificación y especificación detallada de la actividad
```

---

## 5. Instrucciones de Ejecución

### Opción A: Aplicación Web (Recomendada)
1. Abrir directamente `index.html` en cualquier navegador web moderno (haciendo doble clic en el archivo).
2. O bien, servir localmente con Python:
   ```bash
   python -m http.server 8085
   ```
   y abrir en el navegador: [http://localhost:8085](http://localhost:8085).

### Opción B: Script en Python
Para ejecutar la solución matemática y visualizar la tabla de convergencia en la consola:
```bash
python trapecio.py
```

### Opción C: Ejecución de Pruebas Unitarias
Para correr la suite de 42 pruebas matemáticas y de validación:
```bash
node test_calculos.js
```
