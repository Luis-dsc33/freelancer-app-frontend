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
