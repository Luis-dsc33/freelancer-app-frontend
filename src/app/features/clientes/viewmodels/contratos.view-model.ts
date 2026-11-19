import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import { ContratoCliente } from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

type ConfirmacionContrato = { contrato: ContratoCliente; accion: 'finalizar' | 'cancelar' } | null;

@Injectable()
export class ContratosViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly contratos = signal<ContratoCliente[]>([]);
  readonly cargando = signal(false);
  readonly accionId = signal('');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly confirmacion = signal<ConfirmacionContrato>(null);

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listarMisContratos().pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: contratos => this.contratos.set(contratos),
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
          ? 'El contrato se marcó como finalizado.'
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

  private expirarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/cliente/contratos', sesion: 'expirada' },
    });
  }
}
