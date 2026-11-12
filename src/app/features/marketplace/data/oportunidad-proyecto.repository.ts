import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';

/** Abstracción de lectura de oportunidades (DIP). */
export interface IOportunidadProyectoRepository {
  listarOportunidades(): Observable<OportunidadProyecto[]>;
}

export const OPORTUNIDAD_PROYECTO_REPOSITORY =
  new InjectionToken<IOportunidadProyectoRepository>('OPORTUNIDAD_PROYECTO_REPOSITORY');
