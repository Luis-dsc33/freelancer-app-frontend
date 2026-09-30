import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorRecuperacion, EstadoRecuperacion, RestablecerContrasenaRequest,
  SolicitarRecuperacionRequest, SolicitarRecuperacionResponse } from '../models/recuperacion-contrasena';

@Injectable()
export class RecuperacionService {
  // El gateway reemplaza /api/usuarios/ por /api/ en Usuarios.Api.
  private readonly baseUrl = `${environment.gatewayUrl}/api/usuarios/Auth`;
  readonly estado = signal<EstadoRecuperacion>('formulario');
  readonly enviando = signal(false);
  readonly error = signal('');

  constructor(private readonly http: HttpClient) {}

  solicitarRecuperacion(datos: SolicitarRecuperacionRequest): void {
    if (this.enviando()) return;
    this.error.set('');
    this.enviando.set(true);
    this.http.post<SolicitarRecuperacionResponse>(`${this.baseUrl}/recuperar-password`, datos)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.estado.set('enviado'),
        error: (err: HttpErrorResponse) => this.mostrarError(err),
      });
  }

  restablecerContrasena(datos: RestablecerContrasenaRequest): void {
    if (this.enviando()) return;
    this.error.set('');
    this.enviando.set(true);
    this.http.post<void>(`${this.baseUrl}/restablecer-password`, datos)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.estado.set('actualizado'),
        error: (err: HttpErrorResponse) => {
          const respuesta = err.error as ErrorRecuperacion | null;
          if (err.status === 400 && respuesta?.error) this.estado.set('invalido');
          else this.mostrarError(err);
        },
      });
  }

  private mostrarError(err: HttpErrorResponse): void {
    const respuesta = err.error as ErrorRecuperacion | null;
    this.error.set(err.status === 0
      ? 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
      : respuesta?.errores?.map(e => e.mensaje).join(' ') ||
        'No pudimos procesar la solicitud. Inténtalo de nuevo más tarde.');
  }
}
