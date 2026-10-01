import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorPortafolio, GuardarTrabajoPortafolioRequest, TrabajoPortafolio } from '../models/trabajo-portafolio';

@Injectable({ providedIn: 'root' })
export class PortafolioService {
  private readonly baseUrl = `${environment.gatewayUrl}/api/usuarios/Portafolios`;
  readonly trabajos = signal<TrabajoPortafolio[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly sinPermiso = signal(false);

  constructor(private readonly http: HttpClient) {}

  obtenerMiPortafolio(): Observable<TrabajoPortafolio[]> {
    this.cargando.set(true);
    this.error.set('');
    this.sinPermiso.set(false);
    return this.http.get<TrabajoPortafolio[]>(`${this.baseUrl}/mi-portafolio`).pipe(
      tap(trabajos => this.trabajos.set(trabajos)),
      catchError(err => this.mostrarError(err)),
      finalize(() => this.cargando.set(false)),
    );
  }

  agregarTrabajo(datos: GuardarTrabajoPortafolioRequest): Observable<{ id: string }> {
    this.iniciarGuardado();
    return this.http.post<{ id: string }>(`${this.baseUrl}/trabajos`, datos).pipe(
      tap(() => this.mensaje.set('Trabajo agregado a tu portafolio.')),
      catchError(err => this.mostrarError(err)),
      finalize(() => this.guardando.set(false)),
    );
  }

  modificarTrabajo(id: string, datos: GuardarTrabajoPortafolioRequest): Observable<void> {
    this.iniciarGuardado();
    return this.http.put<void>(`${this.baseUrl}/trabajos/${encodeURIComponent(id)}`, datos).pipe(
      tap(() => this.mensaje.set('Cambios guardados correctamente.')),
      catchError(err => this.mostrarError(err)),
      finalize(() => this.guardando.set(false)),
    );
  }

  eliminarTrabajo(id: string): Observable<void> {
    this.iniciarGuardado();
    return this.http.delete<void>(`${this.baseUrl}/trabajos/${encodeURIComponent(id)}`).pipe(
      tap(() => {
        this.trabajos.update(trabajos => trabajos.filter(t => t.id !== id));
        this.mensaje.set('Trabajo eliminado de tu portafolio.');
      }),
      catchError(err => this.mostrarError(err)),
      finalize(() => this.guardando.set(false)),
    );
  }

  private iniciarGuardado(): void {
    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');
  }

  private mostrarError(err: HttpErrorResponse): Observable<never> {
    const respuesta = err.error as ErrorPortafolio | null;
    this.sinPermiso.set(err.status === 403);
    const mensaje = err.status === 0 ? 'No pudimos conectar con el servidor. Inténtalo de nuevo.'
      : err.status === 401 ? 'Tu sesión venció. Inicia sesión nuevamente.'
      : err.status === 403 ? 'Solo una cuenta de estudiante puede administrar su portafolio.'
      : err.status === 404 ? 'No se encontró el portafolio o el trabajo ya no está disponible.'
      : respuesta?.errores?.map(e => e.mensaje).join(' ') || respuesta?.error || 'No se pudo completar la operación. Inténtalo de nuevo.';
    this.error.set(mensaje);
    return throwError(() => err);
  }
}
