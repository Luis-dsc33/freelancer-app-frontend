# Práctica de Automatización de Pruebas Unitarias

**Proyecto Integrador:** CodeBridge (plataforma freelance para estudiantes universitarios)
**Stack Tecnológico:** Angular 22 + Ionic 9 + Capacitor 8
**Framework de pruebas:** Vitest 4.0.18 (runner oficial `@angular/build:unit-test` con entorno `jsdom`)
**Unidad bajo prueba:** `calcularDesglosePago()` — `src/app/core/utils/project-payout.util.ts`
**Fecha de ejecución:** 23 de octubre de 2026

> **Nota técnica:** el repositorio no usa Karma ni Jest. En `angular.json` el target `test` usa el builder `@angular/build:unit-test`, que por defecto ejecuta **Vitest** (sintaxis `describe / it / expect` compatible con Jasmine y Jest). Por eso las pruebas se escribieron y ejecutaron con Vitest, que es lo que ya está configurado en el proyecto.

---

## 1. Prompt de IA (requisito de la rúbrica)

> Eres un ingeniero de calidad experto en **Ionic / Angular**.
> CONTEXTO: proyecto CodeBridge, framework **Angular + Ionic + Capacitor**.
> La función a probar: **`calcularDesglosePago`** — recibe **un objeto `DatosPagoProyecto` `{ presupuesto: number | null | undefined; esUrgente?: boolean; esPrimerProyecto?: boolean }`** y devuelve **un objeto `DesglosePago` con `presupuesto`, `recargoUrgencia`, `subtotal`, `tasaComision`, `comisionPlataforma`, `ivaComision`, `pagoNetoEstudiante` y `totalCliente` (redondeados a 2 decimales); lanza `TypeError` si el presupuesto no es un número válido y `RangeError` si es ≤ 0 o está fuera del rango $100 – $500,000 MXN**.
> CÓDIGO A PROBAR: *(el código completo de la sección 2 de este documento: `project-payout.util.ts`)*
> TAREA: genera 5 casos de prueba con **Vitest** (runner de Angular 22, sintaxis compatible con Jasmine/Jest).
> Usa patrón AAA (// ARRANGE // ACT // ASSERT) y comenta cada sección.

---

## 2. Código fuente bajo prueba

**Archivo:** `src/app/core/utils/project-payout.util.ts`

Reglas de negocio:

| Regla | Valor |
|---|---|
| Recargo por urgencia (lo paga el cliente) | 15 % del presupuesto |
| Comisión de plataforma estándar | 10 % del subtotal |
| Comisión de primer proyecto del estudiante | 5 % del subtotal |
| IVA sobre la comisión (se descuenta al estudiante) | 16 % |
| Rango de presupuesto permitido | $100.00 – $500,000.00 MXN |

```typescript
/**
 * Reglas de negocio de CodeBridge para el desglose de pago de un proyecto freelance.
 *
 * - Recargo por urgencia: 15 % sobre el presupuesto (lo paga el cliente).
 * - Comisión de plataforma: 10 % del subtotal; 5 % si es el primer proyecto del estudiante.
 * - IVA (16 %) sobre la comisión de plataforma, retenido del pago al estudiante.
 * - Presupuesto permitido: de $100.00 a $500,000.00 MXN.
 */
export const PRESUPUESTO_MINIMO = 100;
export const PRESUPUESTO_MAXIMO = 500_000;
export const TASA_RECARGO_URGENCIA = 0.15;
export const TASA_COMISION_ESTANDAR = 0.1;
export const TASA_COMISION_PRIMER_PROYECTO = 0.05;
export const TASA_IVA = 0.16;

export interface DatosPagoProyecto {
  /** Presupuesto acordado en MXN. Puede llegar nulo desde un formulario vacío. */
  presupuesto: number | null | undefined;
  /** El cliente solicita entrega urgente. */
  esUrgente?: boolean;
  /** Es el primer proyecto completado por el estudiante (tarifa preferente). */
  esPrimerProyecto?: boolean;
}

export interface DesglosePago {
  presupuesto: number;
  recargoUrgencia: number;
  subtotal: number;
  tasaComision: number;
  comisionPlataforma: number;
  ivaComision: number;
  pagoNetoEstudiante: number;
  totalCliente: number;
}

/** Redondea a 2 decimales evitando errores de punto flotante (p. ej. 1.005). */
export function redondearMoneda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el desglose de pago de un proyecto.
 * @throws TypeError  si el presupuesto es nulo, indefinido o no es un número finito.
 * @throws RangeError si el presupuesto es cero, negativo o está fuera del rango permitido.
 */
export function calcularDesglosePago(datos: DatosPagoProyecto): DesglosePago {
  const { presupuesto, esUrgente = false, esPrimerProyecto = false } = datos;

  if (presupuesto === null || presupuesto === undefined || typeof presupuesto !== 'number' || !Number.isFinite(presupuesto)) {
    throw new TypeError('El presupuesto debe ser un número válido.');
  }
  if (presupuesto <= 0) {
    throw new RangeError('El presupuesto debe ser mayor a cero.');
  }
  if (presupuesto < PRESUPUESTO_MINIMO) {
    throw new RangeError(`El presupuesto mínimo es de $${PRESUPUESTO_MINIMO} MXN.`);
  }
  if (presupuesto > PRESUPUESTO_MAXIMO) {
    throw new RangeError(`El presupuesto máximo es de $${PRESUPUESTO_MAXIMO} MXN.`);
  }

  const base = redondearMoneda(presupuesto);
  const recargoUrgencia = esUrgente ? redondearMoneda(base * TASA_RECARGO_URGENCIA) : 0;
  const subtotal = redondearMoneda(base + recargoUrgencia);
  const tasaComision = esPrimerProyecto ? TASA_COMISION_PRIMER_PROYECTO : TASA_COMISION_ESTANDAR;
  const comisionPlataforma = redondearMoneda(subtotal * tasaComision);
  const ivaComision = redondearMoneda(comisionPlataforma * TASA_IVA);
  const pagoNetoEstudiante = redondearMoneda(subtotal - comisionPlataforma - ivaComision);

  return {
    presupuesto: base,
    recargoUrgencia,
    subtotal,
    tasaComision,
    comisionPlataforma,
    ivaComision,
    pagoNetoEstudiante,
    totalCliente: subtotal,
  };
}
```

---

## 3. Código de las 5 pruebas automatizadas (patrón AAA)

**Archivo:** `src/app/core/utils/project-payout.util.spec.ts`

```typescript
import {
  calcularDesglosePago,
  PRESUPUESTO_MAXIMO,
  PRESUPUESTO_MINIMO,
} from './project-payout.util';

describe('calcularDesglosePago (CodeBridge - desglose de pago de proyecto)', () => {
  it('CP-01: calcula el desglose estándar de un proyecto de $10,000 sin banderas', () => {
    // ARRANGE: proyecto normal, sin urgencia y sin tarifa de primer proyecto.
    const datos = { presupuesto: 10_000 };

    // ACT: se calcula el desglose de pago.
    const desglose = calcularDesglosePago(datos);

    // ASSERT: comisión 10 % ($1,000), IVA 16 % de la comisión ($160) y neto $8,840.
    expect(desglose).toEqual({
      presupuesto: 10_000,
      recargoUrgencia: 0,
      subtotal: 10_000,
      tasaComision: 0.1,
      comisionPlataforma: 1_000,
      ivaComision: 160,
      pagoNetoEstudiante: 8_840,
      totalCliente: 10_000,
    });
  });

  it('CP-02: aplica recargo por urgencia (15 %) y comisión preferente de primer proyecto (5 %)', () => {
    // ARRANGE: mismo presupuesto, pero activando ambas banderas opcionales de negocio.
    const datos = { presupuesto: 10_000, esUrgente: true, esPrimerProyecto: true };

    // ACT: se calcula el desglose con las banderas activas.
    const desglose = calcularDesglosePago(datos);

    // ASSERT: recargo $1,500 -> subtotal $11,500; comisión 5 % = $575; IVA $92; neto $10,833.
    expect(desglose.recargoUrgencia).toBe(1_500);
    expect(desglose.subtotal).toBe(11_500);
    expect(desglose.tasaComision).toBe(0.05);
    expect(desglose.comisionPlataforma).toBe(575);
    expect(desglose.ivaComision).toBe(92);
    expect(desglose.pagoNetoEstudiante).toBe(10_833);
    expect(desglose.totalCliente).toBe(11_500);
  });

  it('CP-03: redondea con precisión a 2 decimales y acepta los valores de borde del rango', () => {
    // ARRANGE: presupuesto con decimales que genera comisión periódica (33.333...) y límites exactos.
    const datosDecimales = { presupuesto: 333.33 };
    const datosMinimo = { presupuesto: PRESUPUESTO_MINIMO };
    const datosMaximo = { presupuesto: PRESUPUESTO_MAXIMO };

    // ACT: se calculan los tres desgloses.
    const decimal = calcularDesglosePago(datosDecimales);
    const minimo = calcularDesglosePago(datosMinimo);
    const maximo = calcularDesglosePago(datosMaximo);

    // ASSERT: montos redondeados a centavos, la suma cuadra con el total y los bordes son válidos.
    expect(decimal.comisionPlataforma).toBe(33.33);
    expect(decimal.ivaComision).toBe(5.33);
    expect(decimal.pagoNetoEstudiante).toBe(294.67);
    expect(decimal.comisionPlataforma + decimal.ivaComision + decimal.pagoNetoEstudiante)
      .toBeCloseTo(decimal.totalCliente, 2);
    expect(minimo.pagoNetoEstudiante).toBe(88.4);
    expect(maximo.comisionPlataforma).toBe(50_000);
  });

  it('CP-04: rechaza presupuestos fuera de rango o que no son números válidos', () => {
    // ARRANGE: valores por debajo del mínimo, por encima del máximo, NaN e Infinity.
    const debajoDelMinimo = { presupuesto: PRESUPUESTO_MINIMO - 0.01 };
    const arribaDelMaximo = { presupuesto: PRESUPUESTO_MAXIMO + 1 };
    const noNumerico = { presupuesto: Number.NaN };
    const infinito = { presupuesto: Number.POSITIVE_INFINITY };

    // ACT: se envuelve cada llamada en una función para capturar la excepción.
    const calcularDebajo = () => calcularDesglosePago(debajoDelMinimo);
    const calcularArriba = () => calcularDesglosePago(arribaDelMaximo);
    const calcularNaN = () => calcularDesglosePago(noNumerico);
    const calcularInfinito = () => calcularDesglosePago(infinito);

    // ASSERT: se lanzan RangeError/TypeError con mensajes claros para el usuario.
    expect(calcularDebajo).toThrow(RangeError);
    expect(calcularDebajo).toThrow(/mínimo/);
    expect(calcularArriba).toThrow(RangeError);
    expect(calcularArriba).toThrow(/máximo/);
    expect(calcularNaN).toThrow(TypeError);
    expect(calcularInfinito).toThrow(TypeError);
  });

  it('CP-05: rechaza presupuestos nulos, indefinidos, cero o negativos', () => {
    // ARRANGE: valores típicos de un formulario vacío o de datos corruptos.
    const nulo = { presupuesto: null };
    const indefinido = { presupuesto: undefined };
    const cero = { presupuesto: 0 };
    const negativo = { presupuesto: -500 };

    // ACT: se preparan las llamadas para evaluar la excepción lanzada.
    const calcularNulo = () => calcularDesglosePago(nulo);
    const calcularIndefinido = () => calcularDesglosePago(indefinido);
    const calcularCero = () => calcularDesglosePago(cero);
    const calcularNegativo = () => calcularDesglosePago(negativo);

    // ASSERT: nulo/indefinido -> TypeError; cero/negativo -> RangeError "mayor a cero".
    expect(calcularNulo).toThrow(TypeError);
    expect(calcularIndefinido).toThrow('El presupuesto debe ser un número válido.');
    expect(calcularCero).toThrow(RangeError);
    expect(calcularCero).toThrow('El presupuesto debe ser mayor a cero.');
    expect(calcularNegativo).toThrow('El presupuesto debe ser mayor a cero.');
  });
});
```

---

## 4. Matriz de resultados de pruebas

| ID | Descripción del Caso | Entrada (Arrange) | Acción (Act) | Resultado Esperado (Assert) | Resultado Obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-01 | Camino feliz: proyecto estándar sin banderas | `{ presupuesto: 10000 }` | `calcularDesglosePago(datos)` | Recargo $0, subtotal $10,000, tasa 10 %, comisión $1,000, IVA $160, neto $8,840, total $10,000 | Objeto idéntico al esperado (`toEqual`) | ✅ PASS |
| CP-02 | Banderas de negocio: urgencia + primer proyecto | `{ presupuesto: 10000, esUrgente: true, esPrimerProyecto: true }` | `calcularDesglosePago(datos)` | Recargo $1,500, subtotal $11,500, tasa 5 %, comisión $575, IVA $92, neto $10,833, total $11,500 | Los 7 valores coinciden | ✅ PASS |
| CP-03 | Precisión decimal y valores de borde | `333.33`, `100` (mínimo) y `500000` (máximo) | 3 llamadas a `calcularDesglosePago` | Comisión $33.33, IVA $5.33, neto $294.67; la suma cuadra con el total; mínimo → neto $88.40; máximo → comisión $50,000 | Montos redondeados a centavos; bordes aceptados sin error | ✅ PASS |
| CP-04 | Entradas inválidas / fuera de rango | `99.99`, `500001`, `NaN`, `Infinity` | Llamadas envueltas en funciones flecha | `RangeError` con "mínimo" / "máximo"; `TypeError` para `NaN` e `Infinity` | Se lanzaron las excepciones y mensajes esperados | ✅ PASS |
| CP-05 | Valores nulos, indefinidos, cero y negativos | `null`, `undefined`, `0`, `-500` | Llamadas envueltas en funciones flecha | `TypeError` "El presupuesto debe ser un número válido." para nulo/indefinido; `RangeError` "El presupuesto debe ser mayor a cero." para 0 y -500 | Se lanzaron las excepciones y mensajes esperados | ✅ PASS |

**Resumen:** 5 de 5 casos aprobados (**100 % PASS**). Duración de los tests: 20 ms.

---

## 5. Evidencia de ejecución en terminal

**Comando ejecutado** (desde la raíz del proyecto):

```powershell
npx ng test --include=src/app/core/utils/project-payout.util.spec.ts --watch=false --no-progress --reporters=verbose
```

**Salida real de la consola:**

```text
Application bundle generation complete. [13.256 seconds] - 2026-10-23T17:49:52.252Z


 RUN  v4.0.18 C:/Users/kykes/Desktop/Universidad/freelancer-app-frontend

 ✓  app  src/app/core/utils/project-payout.util.spec.ts > calcularDesglosePago (CodeBridge - desglose de pago de proyecto) > CP-01: calcula el desglose estándar de un proyecto de $10,000 sin banderas 6ms
 ✓  app  src/app/core/utils/project-payout.util.spec.ts > calcularDesglosePago (CodeBridge - desglose de pago de proyecto) > CP-02: aplica recargo por urgencia (15 %) y comisión preferente de primer proyecto (5 %) 2ms
 ✓  app  src/app/core/utils/project-payout.util.spec.ts > calcularDesglosePago (CodeBridge - desglose de pago de proyecto) > CP-03: redondea con precisión a 2 decimales y acepta los valores de borde del rango 2ms
 ✓  app  src/app/core/utils/project-payout.util.spec.ts > calcularDesglosePago (CodeBridge - desglose de pago de proyecto) > CP-04: rechaza presupuestos fuera de rango o que no son números válidos 4ms
 ✓  app  src/app/core/utils/project-payout.util.spec.ts > calcularDesglosePago (CodeBridge - desglose de pago de proyecto) > CP-05: rechaza presupuestos nulos, indefinidos, cero o negativos 2ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  11:49:58
   Duration  29.88s (transform 267ms, setup 1.42s, import 47ms, tests 20ms, environment 26.52s)
```

**Comando para tomar una captura de pantalla adicional:**

```powershell
npx ng test --include=src/app/core/utils/project-payout.util.spec.ts --watch=false --reporters=verbose
```

> Vitest no usa navegador (corre en `jsdom`), así que la opción `--browsers=ChromeHeadless` de Karma no aplica. La compilación tarda unos 15 segundos y después aparecen las 5 marcas ✓.

---

## 6. Conclusión técnica

El patrón **AAA (Arrange–Act–Assert)** separa con claridad en cada prueba la preparación de los datos, la ejecución de la regla de negocio y la verificación del resultado. Así cada caso se lee como una especificación del comportamiento de CodeBridge y, si falla, es fácil encontrar la causa. Al aislar el cálculo de pagos en una función pura, sin dependencias HTTP, las pruebas unitarias se ejecutan en milisegundos y comprueban de forma determinista las reglas más críticas para estudiantes y clientes: comisiones, recargos, IVA, redondeo a centavos y validación de entradas. Si un cambio futuro altera una tasa o rompe la precisión monetaria, la prueba correspondiente fallará antes de que el error llegue a producción. Esto protege la confianza de los usuarios en los montos que muestra la plataforma y sirve como documentación ejecutable de las reglas de negocio.
