import { HttpErrorResponse } from '@angular/common/http';

export interface CuerpoErrorApi {
  error?: string;
  message?: string;
  title?: string;
  detail?: string;
  errores?: { campo: string; mensaje: string }[];
  errors?: Record<string, string[]>;
}

export interface OpcionesErrorHttp {
  fallback?: string;
  mensajesEstado?: Partial<Record<number, string>>;
}

const MENSAJES_ESTADO_BASE: Record<number, string> = {
  0: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  401: 'Tu sesión venció. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con el estado actual.',
};

/** Extrae un mensaje legible y consistente desde respuestas HttpErrorResponse del API Gateway. */
export function extraerMensajeErrorHttp(
  err: HttpErrorResponse,
  opciones: OpcionesErrorHttp = {},
): string {
  const custom = opciones.mensajesEstado?.[err.status];
  if (custom) {
    return custom;
  }

  const body = err.error && typeof err.error === 'object'
    ? (err.error as CuerpoErrorApi)
    : null;

  const validaciones = body?.errores?.map(e => e.mensaje).filter(Boolean).join(' ')
    || Object.values(body?.errors ?? {}).flat().filter(Boolean).join(' ');
  if (validaciones) {
    return validaciones;
  }

  const mensajeServidor = typeof err.error === 'string'
    ? err.error.trim()
    : (body?.error || body?.detail || body?.message || body?.title || '').trim();

  if (mensajeServidor && !/ocurrió un error inesperado|unexpected error/i.test(mensajeServidor)) {
    return mensajeServidor;
  }

  return MENSAJES_ESTADO_BASE[err.status]
    ?? opciones.fallback
    ?? 'No se pudo completar la operación. Inténtalo de nuevo.';
}
