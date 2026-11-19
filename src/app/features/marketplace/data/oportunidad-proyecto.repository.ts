import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltrosMarketplace, OportunidadProyecto } from '../models/oportunidad-proyecto';

/** Abstracción de lectura de oportunidades (DIP). */
export interface IOportunidadProyectoRepository {
  listarOportunidades(filtros?: FiltrosMarketplace): Observable<OportunidadProyecto[]>;
  obtenerDetalle(id: string): Observable<OportunidadProyecto>;
}

export const OPORTUNIDAD_PROYECTO_REPOSITORY =
  new InjectionToken<IOportunidadProyectoRepository>('OPORTUNIDAD_PROYECTO_REPOSITORY');
