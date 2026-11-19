import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import { RetirarPostulacionCommand } from '../commands/retirar-postulacion.command';
import { RetirarPostulacionHandler } from '../commands/retirar-postulacion.handler';
import { EstadoPostulacion, PostulacionEstudiante } from '../models/postulacion';
import { ListarMisPostulacionesHandler } from '../queries/listar-mis-postulaciones.handler';
import { ListarMisPostulacionesQuery } from '../queries/listar-mis-postulaciones.query';

export type FiltroEstadoPostulacion = 'Todas' | EstadoPostulacion;

/** ViewModel de Mis Postulaciones (MVVM + CQRS). */
@Injectable()
export class MisPostulacionesViewModel {
  private readonly listarHandler = inject(ListarMisPostulacionesHandler);
  private readonly retirarHandler = inject(RetirarPostulacionHandler);

  readonly postulaciones = signal<PostulacionEstudiante[]>([]);
  readonly filtroEstado = signal<FiltroEstadoPostulacion>('Todas');
  readonly postulacionARetirar = signal<PostulacionEstudiante | null>(null);
  readonly cargando = signal(false);
  readonly procesandoId = signal<string | null>(null);
  readonly error = signal('');
  readonly mensajeExito = signal('');

  readonly postulacionesFiltradas = computed(() => {
    const filtro = this.filtroEstado();
    const lista = this.postulaciones();
    return filtro === 'Todas' ? lista : lista.filter(p => p.estado === filtro);
  });

  readonly conteos = computed(() => {
    const lista = this.postulaciones();
    return {
      total: lista.length,
      pendientes: lista.filter(p => p.estado === 'Pendiente').length,
      aceptadas: lista.filter(p => p.estado === 'Aceptada').length,
      rechazadas: lista.filter(p => p.estado === 'Rechazada').length,
      retiradas: lista.filter(p => p.estado === 'Retirada').length,
    };
  });

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.listarHandler
      .execute(new ListarMisPostulacionesQuery())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: items => this.postulaciones.set(items),
        error: (err: HttpErrorResponse) => {
          this.postulaciones.set([]);
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                403: 'Solo las cuentas de estudiante pueden consultar sus postulaciones.',
                404: 'El servicio de postulaciones aún no está disponible.',
              },
              fallback: 'No se pudieron cargar tus postulaciones.',
            }),
          );
        },
      });
  }

  seleccionarFiltro(filtro: FiltroEstadoPostulacion): void {
    this.filtroEstado.set(filtro);
  }

  solicitarRetiro(postulacion: PostulacionEstudiante): void {
    if (postulacion.estado !== 'Pendiente' || this.procesandoId()) return;
    this.postulacionARetirar.set(postulacion);
  }

  cancelarRetiro(): void {
    if (!this.procesandoId()) {
      this.postulacionARetirar.set(null);
    }
  }

  confirmarRetiro(): void {
    const postulacion = this.postulacionARetirar();
    if (!postulacion || this.procesandoId()) return;

    this.procesandoId.set(postulacion.id);
    this.error.set('');
    this.mensajeExito.set('');

    this.retirarHandler
      .execute(new RetirarPostulacionCommand(postulacion.id))
      .pipe(finalize(() => this.procesandoId.set(null)))
      .subscribe({
        next: () => {
          this.postulaciones.update(lista =>
            lista.map(item =>
              item.id === postulacion.id
                ? { ...item, estado: 'Retirada', resueltaEn: new Date().toISOString() }
                : item,
            ),
          );
          this.postulacionARetirar.set(null);
          this.mensajeExito.set('Postulación retirada correctamente.');
        },
        error: (err: HttpErrorResponse) => {
          this.postulacionARetirar.set(null);
          this.error.set(
            extraerMensajeErrorHttp(err, {
              fallback: 'No se pudo retirar la postulación.',
            }),
          );
        },
      });
  }
}
