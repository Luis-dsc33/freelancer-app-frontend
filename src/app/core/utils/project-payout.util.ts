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
