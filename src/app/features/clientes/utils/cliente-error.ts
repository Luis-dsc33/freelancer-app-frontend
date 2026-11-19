import { HttpErrorResponse } from '@angular/common/http';

export function mensajeErrorCliente(err: HttpErrorResponse, accion: string): string {
  if (err.status === 0) return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  if (err.status === 401) return 'Tu sesión venció. Inicia sesión nuevamente.';
  if (err.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';

  const body = typeof err.error === 'object' && err.error !== null
    ? err.error as Record<string, unknown>
    : null;
  const detalle = body?.['detail'] ?? body?.['title'] ?? body?.['message'] ?? body?.['error'];
  if (typeof detalle === 'string' && detalle.trim()) return detalle;

  const erroresLista = body?.['errores'];
  if (Array.isArray(erroresLista)) {
    const mensajes = erroresLista
      .map(item => {
        if (typeof item !== 'object' || item === null) return '';
        const registro = item as Record<string, unknown>;
        return typeof registro['mensaje'] === 'string' ? registro['mensaje'].trim() : '';
      })
      .filter(Boolean);
    if (mensajes.length) return mensajes.join(' ');
  }

  const errores = body?.['errors'];
  if (typeof errores === 'object' && errores !== null) {
    const mensajes = Object.values(errores)
      .flatMap(valor => Array.isArray(valor) ? valor : [valor])
      .filter((valor): valor is string => typeof valor === 'string' && !!valor.trim());
    if (mensajes.length) return mensajes.join(' ');
  }

  return `No se pudo ${accion}. Inténtalo de nuevo.`;
}
