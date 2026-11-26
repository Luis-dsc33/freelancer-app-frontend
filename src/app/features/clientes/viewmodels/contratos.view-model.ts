import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import { AuthService } from '../../usuarios/services/auth.service';
import { ContratoCliente } from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { ResenasClienteService } from '../services/resenas-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

type ConfirmacionContrato = { contrato: ContratoCliente; accion: 'finalizar' | 'cancelar' } | null;

@Injectable()
export class ContratosViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly resenas = inject(ResenasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly contratos = signal<ContratoCliente[]>([]);
  readonly cargando = signal(false);
  readonly accionId = signal('');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly confirmacion = signal<ConfirmacionContrato>(null);

  /** Contratos en los que ya emití reseña (`GET /api/resenas/mis-resenas-emitidas`). */
  readonly contratosCalificados = signal<Set<string>>(new Set());
  readonly contratoACalificar = signal<ContratoCliente | null>(null);
  readonly enviandoResena = signal(false);
  readonly errorResena = signal('');

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listarMisContratos().pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: contratos => {
        this.contratos.set(contratos);
        this.sincronizarResenasEmitidas();
      },
      error: (err: HttpErrorResponse) => {
        this.contratos.set([]);
        this.error.set(mensajeErrorCliente(err, 'cargar tus contratos'));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  pedirConfirmacion(contrato: ContratoCliente, accion: 'finalizar' | 'cancelar'): void {
    this.error.set('');
    this.confirmacion.set({ contrato, accion });
  }

  cancelarConfirmacion(): void {
    this.confirmacion.set(null);
  }

  confirmarAccion(): void {
    const confirmacion = this.confirmacion();
    if (!confirmacion || this.accionId()) return;
    this.confirmacion.set(null);
    const { contrato, accion } = confirmacion;
    this.accionId.set(contrato.id);
    this.error.set('');
    this.mensaje.set('');
    const solicitud = accion === 'finalizar'
      ? this.servicio.finalizarContrato(contrato.id)
      : this.servicio.cancelarContrato(contrato.id);

    solicitud.pipe(finalize(() => this.accionId.set(''))).subscribe({
      next: () => {
        this.mensaje.set(accion === 'finalizar'
          ? 'El contrato se marcó como finalizado. Ya puedes calificar al estudiante.'
          : 'El contrato se canceló.');
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeErrorCliente(err, accion === 'finalizar' ? 'finalizar el contrato' : 'cancelar el contrato'));
        if (err.status === 401) this.expirarSesion();
      },
    });
  }

  esActivo(contrato: ContratoCliente): boolean {
    return contrato.estado.toLowerCase() === 'activo';
  }

  esFinalizado(contrato: ContratoCliente): boolean {
    return contrato.estado.toLowerCase() === 'finalizado';
  }

  estaCalificado(contratoId: string): boolean {
    return this.contratosCalificados().has(contratoId);
  }

  /** «Calificar» solo aplica a contratos `Finalizado` que aún no califiqué. */
  puedeCalificar(contrato: ContratoCliente): boolean {
    return this.esFinalizado(contrato) && !this.estaCalificado(contrato.id);
  }

  abrirCalificacion(contrato: ContratoCliente): void {
    if (!this.puedeCalificar(contrato) || this.enviandoResena()) return;
    this.errorResena.set('');
    this.contratoACalificar.set(contrato);
  }

  cerrarCalificacion(): void {
    if (this.enviandoResena()) return;
    this.contratoACalificar.set(null);
    this.errorResena.set('');
  }

  enviarCalificacion(puntuacion: number, comentario: string): void {
    const contrato = this.contratoACalificar();
    if (!contrato || this.enviandoResena()) return;

    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      this.errorResena.set('Selecciona una puntuación entre 1 y 5 estrellas.');
      return;
    }
    const texto = comentario.trim();
    if (!texto) {
      this.errorResena.set('Escribe un breve comentario sobre tu experiencia con el estudiante.');
      return;
    }
    if (texto.length > 2000) {
      this.errorResena.set('El comentario no puede exceder 2000 caracteres.');
      return;
    }

    this.enviandoResena.set(true);
    this.errorResena.set('');
    this.mensaje.set('');

    this.resenas
      .calificarEstudiante(contrato.id, { puntuacion, comentario: texto })
      .pipe(finalize(() => this.enviandoResena.set(false)))
      .subscribe({
        next: () => {
          this.marcarCalificado(contrato.id);
          this.contratoACalificar.set(null);
          this.mensaje.set('¡Gracias! Tu reseña hacia el estudiante ha sido registrada.');
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) this.marcarCalificado(contrato.id);
          if (err.status === 401) {
            this.expirarSesion();
            return;
          }
          this.errorResena.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                404: 'El contrato o el servicio de reseñas no está disponible.',
                409: 'Ya calificaste al estudiante en este contrato.',
              },
              fallback: 'No se pudo enviar la reseña. Inténtalo de nuevo.',
            }),
          );
        },
      });
  }

  private marcarCalificado(contratoId: string): void {
    this.contratosCalificados.update(actual => new Set(actual).add(contratoId));
  }

  private sincronizarResenasEmitidas(): void {
    this.resenas
      .listarMisResenasEmitidas()
      .pipe(catchError(() => of([])))
      .subscribe(emitidas => {
        if (emitidas.length === 0) return;
        this.contratosCalificados.update(actual => {
          const copia = new Set(actual);
          for (const resena of emitidas) copia.add(resena.contratoId);
          return copia;
        });
      });
  }

  private expirarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/cliente/contratos', sesion: 'expirada' },
    });
  }
}
