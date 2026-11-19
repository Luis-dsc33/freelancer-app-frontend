import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import { PostulacionCliente } from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

type ConfirmacionPostulacion = { postulacion: PostulacionCliente; decision: 'aceptar' | 'rechazar' } | null;

@Injectable()
export class PostulacionesViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly postulaciones = signal<PostulacionCliente[]>([]);
  readonly cargando = signal(false);
  readonly accionId = signal('');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly contratoCreado = signal(false);
  readonly confirmacion = signal<ConfirmacionPostulacion>(null);

  cargar(ofertaId: string): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listarPostulaciones(ofertaId).pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: items => this.postulaciones.set(items),
      error: (err: HttpErrorResponse) => {
        this.postulaciones.set([]);
        this.error.set(mensajeErrorCliente(err, 'cargar las postulaciones'));
        if (err.status === 401) this.expirarSesion(ofertaId);
      },
    });
  }

  estaPendiente(postulacion: PostulacionCliente): boolean {
    return postulacion.estado.toLowerCase() === 'pendiente';
  }

  estaAceptada(postulacion: PostulacionCliente): boolean {
    const estado = postulacion.estado.toLowerCase();
    return estado === 'aceptada' || estado === 'aceptado';
  }

  pedirResolucion(postulacion: PostulacionCliente, decision: 'aceptar' | 'rechazar'): void {
    if (!this.estaPendiente(postulacion)) return;
    this.error.set('');
    this.confirmacion.set({ postulacion, decision });
  }

  cancelarResolucion(): void {
    this.confirmacion.set(null);
  }

  confirmarResolucion(ofertaId: string): void {
    const confirmacion = this.confirmacion();
    if (!confirmacion) return;
    this.confirmacion.set(null);
    this.resolver(confirmacion.postulacion, confirmacion.decision, ofertaId);
  }

  resolver(postulacion: PostulacionCliente, decision: 'aceptar' | 'rechazar', ofertaId: string): void {
    if (this.accionId() || !this.estaPendiente(postulacion)) return;
    this.error.set('');
    this.mensaje.set('');
    this.accionId.set(postulacion.id);

    const solicitud = decision === 'aceptar'
      ? this.servicio.aceptarPostulacion(postulacion.id)
      : this.servicio.rechazarPostulacion(postulacion.id);
    solicitud.pipe(finalize(() => this.accionId.set(''))).subscribe({
      next: () => {
        this.mensaje.set(decision === 'aceptar'
          ? 'Postulación aceptada. Ya puedes iniciar el contrato.'
          : 'Postulación rechazada.');
        this.cargar(ofertaId);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeErrorCliente(err, `${decision} la postulación`));
        if (err.status === 401) this.expirarSesion(ofertaId);
      },
    });
  }

  crearContrato(postulacion: PostulacionCliente): void {
    if (this.accionId() || !this.estaAceptada(postulacion)) return;
    this.error.set('');
    this.mensaje.set('');
    this.contratoCreado.set(false);
    this.accionId.set(postulacion.id);
    this.servicio.crearContrato(postulacion.id).pipe(
      finalize(() => this.accionId.set('')),
    ).subscribe({
      next: () => {
        this.contratoCreado.set(true);
        this.mensaje.set('El contrato se creó correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeErrorCliente(err, 'crear el contrato'));
        if (err.status === 401) this.expirarSesion(postulacion.proyectoId);
      },
    });
  }

  irAContratos(): void {
    void this.router.navigate(['/cliente/contratos']);
  }

  private expirarSesion(ofertaId: string): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: `/cliente/ofertas/${encodeURIComponent(ofertaId)}/postulaciones`, sesion: 'expirada' },
    });
  }
}
