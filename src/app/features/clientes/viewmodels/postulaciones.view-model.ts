import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../usuarios/services/auth.service';
import { OfertaCliente, PostulacionCliente } from '../models/oferta-cliente';
import { OfertasClienteService } from '../services/ofertas-cliente.service';
import { mensajeErrorCliente } from '../utils/cliente-error';

type ConfirmacionPostulacion = { postulacion: PostulacionCliente; decision: 'aceptar' | 'rechazar' } | null;

function formatearFechaIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function normalizarFechaOnly(valor?: string | null): string | null {
  if (!valor) return null;
  const recorte = valor.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(recorte) ? recorte : null;
}

@Injectable()
export class PostulacionesViewModel {
  private readonly servicio = inject(OfertasClienteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly postulaciones = signal<PostulacionCliente[]>([]);
  readonly oferta = signal<OfertaCliente | null>(null);
  readonly cargando = signal(false);
  readonly accionId = signal('');
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly contratoCreado = signal(false);
  readonly confirmacion = signal<ConfirmacionPostulacion>(null);

  /** Formulario inline para formalizar el contrato (`CrearContratoRequest`). */
  readonly postulacionAContratar = signal<PostulacionCliente | null>(null);
  readonly importeAcordado = signal<number>(1000);
  readonly fechaInicio = signal<string>(formatearFechaIso(new Date()));
  readonly fechaCompromiso = signal<string>(formatearFechaIso(new Date(Date.now() + 14 * 86_400_000)));

  cargar(ofertaId: string): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio
      .obtenerOferta(ofertaId)
      .pipe(catchError(() => of(null)))
      .subscribe(oferta => {
        if (oferta) {
          this.oferta.set(oferta);
          this.inicializarValoresContrato(oferta);
        }
      });

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

  abrirFormularioContrato(postulacion: PostulacionCliente): void {
    if (this.accionId() || !this.estaAceptada(postulacion)) return;
    this.error.set('');
    this.inicializarValoresContrato(this.oferta());
    this.postulacionAContratar.set(postulacion);
  }

  cerrarFormularioContrato(): void {
    if (this.accionId()) return;
    this.postulacionAContratar.set(null);
  }

  actualizarImporte(valor: string | number): void {
    const numero = typeof valor === 'number' ? valor : Number(valor);
    this.importeAcordado.set(Number.isFinite(numero) ? numero : 0);
  }

  crearContrato(postulacion?: PostulacionCliente): void {
    const objetivo = postulacion ?? this.postulacionAContratar();
    if (!objetivo || this.accionId() || !this.estaAceptada(objetivo)) return;

    const importe = Number(this.importeAcordado());
    if (!Number.isFinite(importe) || importe <= 0) {
      this.error.set('El importe acordado debe ser mayor que 0.');
      return;
    }

    const inicio = normalizarFechaOnly(this.fechaInicio());
    const compromiso = normalizarFechaOnly(this.fechaCompromiso());
    if (!inicio || !compromiso) {
      this.error.set('Selecciona fechas válidas de inicio y compromiso.');
      return;
    }
    if (compromiso < inicio) {
      this.error.set('La fecha de compromiso debe ser igual o posterior a la fecha de inicio.');
      return;
    }

    this.error.set('');
    this.mensaje.set('');
    this.contratoCreado.set(false);
    this.accionId.set(objetivo.id);

    this.servicio
      .crearContrato({
        postulacionId: objetivo.id,
        importeAcordado: importe,
        fechaInicio: inicio,
        fechaCompromiso: compromiso,
      })
      .pipe(finalize(() => this.accionId.set('')))
      .subscribe({
        next: () => {
          this.postulacionAContratar.set(null);
          this.contratoCreado.set(true);
          this.mensaje.set('El contrato se creó correctamente.');
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeErrorCliente(err, 'crear el contrato'));
          if (err.status === 401) this.expirarSesion(objetivo.proyectoId);
        },
      });
  }

  irAContratos(): void {
    void this.router.navigate(['/cliente/contratos']);
  }

  private inicializarValoresContrato(oferta: OfertaCliente | null): void {
    const hoy = formatearFechaIso(new Date());
    const enDosSemanas = formatearFechaIso(new Date(Date.now() + 14 * 86_400_000));
    const presupuesto = Number(oferta?.presupuesto ?? 0);
    this.importeAcordado.set(presupuesto > 0 ? presupuesto : 1000);
    this.fechaInicio.set(hoy);

    const limite = normalizarFechaOnly(oferta?.fechaLimite);
    this.fechaCompromiso.set(limite && limite >= hoy ? limite : enDosSemanas);
  }

  private expirarSesion(ofertaId: string): void {
    this.auth.logout();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: `/cliente/ofertas/${encodeURIComponent(ofertaId)}/postulaciones`, sesion: 'expirada' },
    });
  }
}
