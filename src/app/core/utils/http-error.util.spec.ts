import { HttpErrorResponse } from '@angular/common/http';
import { extraerMensajeErrorHttp } from './http-error.util';

describe('extraerMensajeErrorHttp', () => {
  it('prioriza mensajes personalizados por código HTTP', () => {
    const err = new HttpErrorResponse({ status: 403 });
    expect(extraerMensajeErrorHttp(err, { mensajesEstado: { 403: 'Solo estudiantes.' } }))
      .toBe('Solo estudiantes.');
  });

  it('extrae errores de validación de FluentValidation', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { errores: [{ campo: 'Mensaje', mensaje: 'El mensaje es obligatorio.' }] },
    });
    expect(extraerMensajeErrorHttp(err)).toBe('El mensaje es obligatorio.');
  });

  it('extrae errores de ModelState estándar de ASP.NET', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { errors: { Puntuacion: ['Debe estar entre 1 y 5.'] } },
    });
    expect(extraerMensajeErrorHttp(err)).toBe('Debe estar entre 1 y 5.');
  });

  it('devuelve el mensaje base de red cuando status es 0', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(extraerMensajeErrorHttp(err)).toContain('No pudimos conectar');
  });
});
