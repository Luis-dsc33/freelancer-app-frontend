import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { extraerMensajeErrorHttp } from '../../../core/utils/http-error.util';
import { calcularDesglosePago } from '../../../core/utils/project-payout.util';
import { CalificarClienteCommand } from '../commands/calificar-cliente.command';
import { CalificarClienteHandler } from '../commands/calificar-cliente.handler';
import { CancelarContratoCommand } from '../commands/cancelar-contrato.command';
import { CancelarContratoHandler } from '../commands/cancelar-contrato.handler';
import { FinalizarContratoCommand } from '../commands/finalizar-contrato.command';
import { FinalizarContratoHandler } from '../commands/finalizar-contrato.handler';
import { ContratoEstudiante, EstadoContrato } from '../models/contrato';
import { ListarMisContratosHandler } from '../queries/listar-mis-contratos.handler';
import { ListarMisContratosQuery } from '../queries/listar-mis-contratos.query';
import { ListarMisResenasEmitidasHandler } from '../queries/listar-mis-resenas-emitidas.handler';
import { ListarMisResenasEmitidasQuery } from '../queries/listar-mis-resenas-emitidas.query';

export type FiltroEstadoContrato = 'Todos' | EstadoContrato;
export type AccionContrato = 'finalizar' | 'cancelar';

export interface ContratoVista extends ContratoEstudiante {
  pagoNetoEstimado: number | null;
}

/** ViewModel de Mis Contratos y Calificación al Cliente (MVVM + CQRS). */
@Injectable()
export class MisContratosViewModel {
  private readonly listarContratosHandler = inject(ListarMisContratosHandler);
  private readonly finalizarHandler = inject(FinalizarContratoHandler);
  private readonly cancelarHandler = inject(CancelarContratoHandler);
  private readonly calificarHandler = inject(CalificarClienteHandler);
  private readonly listarResenasHandler = inject(ListarMisResenasEmitidasHandler, {
    optional: true,
  });

  readonly contratos = signal<ContratoVista[]>([]);
  readonly filtroEstado = signal<FiltroEstadoContrato>('Todos');
  readonly contratosCalificados = signal<Set<string>>(new Set());

  readonly cargando = signal(false);
  readonly procesandoId = signal<string | null>(null);
  readonly error = signal('');
  readonly mensajeExito = signal('');

  readonly contratoPendienteAccion = signal<ContratoVista | null>(null);
  readonly accionPendiente = signal<AccionContrato | null>(null);

  readonly contratoACalificar = signal<ContratoVista | null>(null);
  readonly enviandoResena = signal(false);
  readonly errorResena = signal('');

  readonly contratosFiltrados = computed(() => {
    const filtro = this.filtroEstado();
    const lista = this.contratos();
    return filtro === 'Todos' ? lista : lista.filter(c => c.estado === filtro);
  });

  readonly conteos = computed(() => {
    const lista = this.contratos();
    return {
      total: lista.length,
      activos: lista.filter(c => c.estado === 'Activo').length,
      finalizados: lista.filter(c => c.estado === 'Finalizado').length,
      cancelados: lista.filter(c => c.estado === 'Cancelado').length,
    };
  });

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.listarContratosHandler
      .execute(new ListarMisContratosQuery())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: lista => {
          const calificados = new Set(this.contratosCalificados());
          for (const c of lista) {
            if (c.yaCalificadoPorEstudiante) {
              calificados.add(c.id);
            }
          }
          this.contratosCalificados.set(calificados);
          this.contratos.set(lista.map(c => this.mapearVista(c)));
          this.sincronizarResenasEmitidas();
        },
        error: (err: HttpErrorResponse) => {
          this.contratos.set([]);
          this.error.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                403: 'Solo las cuentas de estudiante pueden consultar sus contratos.',
                404: 'El servicio de contratos aún no está disponible.',
              },
              fallback: 'No se pudieron cargar tus contratos.',
            }),
          );
        },
      });
  }

  seleccionarFiltro(filtro: FiltroEstadoContrato): void {
    this.filtroEstado.set(filtro);
  }

  estaCalificado(contratoId: string): boolean {
    return this.contratosCalificados().has(contratoId);
  }

  solicitarAccion(contrato: ContratoVista, accion: AccionContrato): void {
    if (contrato.estado !== 'Activo' || this.procesandoId()) return;
    this.contratoPendienteAccion.set(contrato);
    this.accionPendiente.set(accion);
  }

  cerrarConfirmacionAccion(): void {
    if (!this.procesandoId()) {
      this.contratoPendienteAccion.set(null);
      this.accionPendiente.set(null);
    }
  }

  confirmarAccionContrato(): void {
    const contrato = this.contratoPendienteAccion();
    const accion = this.accionPendiente();
    if (!contrato || !accion || this.procesandoId()) return;

    this.procesandoId.set(contrato.id);
    this.error.set('');
    this.mensajeExito.set('');

    const ejecucion$ =
      accion === 'finalizar'
        ? this.finalizarHandler.execute(new FinalizarContratoCommand(contrato.id))
        : this.cancelarHandler.execute(new CancelarContratoCommand(contrato.id));

    const nuevoEstado: EstadoContrato = accion === 'finalizar' ? 'Finalizado' : 'Cancelado';

    ejecucion$.pipe(finalize(() => this.procesandoId.set(null))).subscribe({
      next: () => {
        const cerradoEn = new Date().toISOString();
        this.contratos.update(lista =>
          lista.map(item =>
            item.id === contrato.id ? { ...item, estado: nuevoEstado, cerradoEn } : item,
          ),
        );
        this.contratoPendienteAccion.set(null);
        this.accionPendiente.set(null);
        this.mensajeExito.set(
          accion === 'finalizar'
            ? 'Contrato marcado como finalizado. Ya puedes calificar al cliente.'
            : 'Contrato cancelado correctamente.',
        );
      },
      error: (err: HttpErrorResponse) => {
        this.contratoPendienteAccion.set(null);
        this.accionPendiente.set(null);
        this.error.set(
          extraerMensajeErrorHttp(err, {
            fallback: `No se pudo ${accion} el contrato.`,
          }),
        );
      },
    });
  }

  abrirModalResena(contrato: ContratoVista): void {
    if (contrato.estado !== 'Finalizado' || this.estaCalificado(contrato.id)) return;
    this.errorResena.set('');
    this.contratoACalificar.set(contrato);
  }

  cerrarModalResena(): void {
    if (!this.enviandoResena()) {
      this.contratoACalificar.set(null);
      this.errorResena.set('');
    }
  }

  enviarResena(puntuacion: number, comentario: string): void {
    const contrato = this.contratoACalificar();
    if (!contrato || this.enviandoResena()) return;

    if (puntuacion < 1 || puntuacion > 5 || !Number.isInteger(puntuacion)) {
      this.errorResena.set('Selecciona una puntuación entre 1 y 5 estrellas.');
      return;
    }

    const texto = comentario.trim();
    if (!texto) {
      this.errorResena.set('Escribe un breve comentario sobre tu experiencia con el cliente.');
      return;
    }
    if (texto.length > 2000) {
      this.errorResena.set('El comentario no puede exceder 2000 caracteres.');
      return;
    }

    this.enviandoResena.set(true);
    this.errorResena.set('');
    this.mensajeExito.set('');

    this.calificarHandler
      .execute(new CalificarClienteCommand(contrato.id, puntuacion, texto))
      .pipe(finalize(() => this.enviandoResena.set(false)))
      .subscribe({
        next: () => {
          this.contratosCalificados.update(actual => {
            const copia = new Set(actual);
            copia.add(contrato.id);
            return copia;
          });
          this.contratos.update(lista =>
            lista.map(c =>
              c.id === contrato.id ? { ...c, yaCalificadoPorEstudiante: true } : c,
            ),
          );
          this.contratoACalificar.set(null);
          this.mensajeExito.set('¡Gracias! Tu reseña hacia el cliente ha sido registrada.');
        },
        error: (err: HttpErrorResponse) => {
          this.errorResena.set(
            extraerMensajeErrorHttp(err, {
              mensajesEstado: {
                404: 'El servicio de reseñas aún no está disponible.',
                409: 'Ya calificaste al cliente en este contrato.',
              },
              fallback: 'No se pudo enviar la reseña. Inténtalo de nuevo.',
            }),
          );
        },
      });
  }

  private sincronizarResenasEmitidas(): void {
    if (!this.listarResenasHandler) return;
    this.listarResenasHandler
      .execute(new ListarMisResenasEmitidasQuery())
      .pipe(catchError(() => of([])))
      .subscribe(resenas => {
        if (resenas.length === 0) return;
        this.contratosCalificados.update(actual => {
          const copia = new Set(actual);
          for (const r of resenas) {
            copia.add(r.contratoId);
          }
          return copia;
        });
      });
  }

  private mapearVista(contrato: ContratoEstudiante): ContratoVista {
    let pagoNetoEstimado: number | null = null;
    try {
      pagoNetoEstimado = calcularDesglosePago({
        presupuesto: contrato.importeAcordado,
      }).pagoNetoEstudiante;
    } catch {
      pagoNetoEstimado = null;
    }
    return { ...contrato, pagoNetoEstimado };
  }
}
