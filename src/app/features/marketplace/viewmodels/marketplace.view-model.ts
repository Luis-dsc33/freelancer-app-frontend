import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { calcularDesglosePago } from '../../../core/utils/project-payout.util';
import { ErrorMarketplace, OportunidadProyecto } from '../models/oportunidad-proyecto';
import { ListarOportunidadesHandler } from '../queries/listar-oportunidades.handler';
import { ListarOportunidadesQuery } from '../queries/listar-oportunidades.query';

export interface OportunidadVista extends OportunidadProyecto {
  pagoEstimadoEstudiante: number | null;
}

/**
 * ViewModel del marketplace (MVVM).
 * Expone estado reactivo a la View y orquesta queries CQRS.
 */
@Injectable()
export class MarketplaceViewModel {
  private readonly listarOportunidades = inject(ListarOportunidadesHandler);

  readonly oportunidades = signal<OportunidadVista[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly total = computed(() => this.oportunidades().length);
  readonly urgentes = computed(() => this.oportunidades().filter(o => o.esUrgente).length);

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.listarOportunidades.execute(new ListarOportunidadesQuery()).pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: (items) => this.oportunidades.set(items.map(o => this.mapearVista(o))),
      error: (err: HttpErrorResponse) => {
        this.oportunidades.set([]);
        this.error.set(this.mensajeError(err));
      },
    });
  }

  private mapearVista(oportunidad: OportunidadProyecto): OportunidadVista {
    let pagoEstimadoEstudiante: number | null = null;
    try {
      pagoEstimadoEstudiante = calcularDesglosePago({
        presupuesto: oportunidad.presupuesto,
        esUrgente: oportunidad.esUrgente,
      }).pagoNetoEstudiante;
    } catch {
      pagoEstimadoEstudiante = null;
    }

    return {
      ...oportunidad,
      habilidadesRequeridas: oportunidad.habilidadesRequeridas ?? [],
      pagoEstimadoEstudiante,
    };
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No pudimos conectar con el marketplace. Revisa tu conexión e inténtalo de nuevo.';
    }
    if (err.status === 401) {
      return 'Tu sesión venció. Inicia sesión nuevamente.';
    }
    if (err.status === 403) {
      return 'No tienes permiso para ver las oportunidades del marketplace.';
    }
    if (err.status === 404) {
      return 'El servicio de marketplace aún no está disponible.';
    }

    const body = err.error as ErrorMarketplace | null;
    return body?.errores?.map(e => e.mensaje).join(' ')
      || body?.error
      || 'No se pudieron cargar las oportunidades. Inténtalo de nuevo.';
  }
}
