import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FiltrosMarketplace,
  OportunidadProyecto,
  RespuestaPaginadaOportunidades,
} from '../models/oportunidad-proyecto';
import { IOportunidadProyectoRepository } from './oportunidad-proyecto.repository';

/**
 * Adaptador HTTP hacia Marketplace.Api.
 * Ruta pública expuesta por Nginx: /api/marketplace/Proyectos
 */
@Injectable()
export class OportunidadProyectoHttpRepository implements IOportunidadProyectoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/marketplace/Proyectos`;

  listarOportunidades(filtros?: FiltrosMarketplace): Observable<OportunidadProyecto[]> {
    const params = this.construirParams(filtros);
    const request$ = params
      ? this.http.get<OportunidadProyecto[] | RespuestaPaginadaOportunidades>(this.baseUrl, { params })
      : this.http.get<OportunidadProyecto[] | RespuestaPaginadaOportunidades>(this.baseUrl);

    return request$.pipe(
      map(respuesta => (Array.isArray(respuesta) ? respuesta : respuesta?.items ?? [])),
    );
  }

  obtenerDetalle(id: string): Observable<OportunidadProyecto> {
    return this.http.get<OportunidadProyecto>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  private construirParams(filtros?: FiltrosMarketplace): HttpParams | undefined {
    if (!filtros) return undefined;

    let params = new HttpParams();
    let tieneFiltros = false;

    const asignar = (clave: string, valor: string | number | boolean | null | undefined) => {
      if (valor === undefined || valor === null || valor === '' || valor === false) return;
      params = params.set(clave, String(valor));
      tieneFiltros = true;
    };

    asignar('busqueda', filtros.busqueda?.trim());
    asignar('disciplina', filtros.disciplina?.trim());
    asignar('modalidad', filtros.modalidad?.trim());
    asignar('presupuestoMin', filtros.presupuestoMin);
    asignar('presupuestoMax', filtros.presupuestoMax);
    asignar('soloUrgentes', filtros.soloUrgentes);
    asignar('habilidad', filtros.habilidad?.trim());
    asignar('page', filtros.page);
    asignar('pageSize', filtros.pageSize);

    if (filtros.skillIds && filtros.skillIds.length > 0) {
      for (const skillId of filtros.skillIds) {
        if (skillId.trim()) {
          params = params.append('skillIds', skillId.trim());
          tieneFiltros = true;
        }
      }
    }

    return tieneFiltros ? params : undefined;
  }
}
