import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import {
  IOportunidadProyectoRepository,
  OPORTUNIDAD_PROYECTO_REPOSITORY,
} from '../data/oportunidad-proyecto.repository';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';
import { ObtenerDetalleOportunidadQuery } from './obtener-detalle-oportunidad.query';

@Injectable()
export class ObtenerDetalleOportunidadHandler
  implements IQueryHandler<ObtenerDetalleOportunidadQuery, OportunidadProyecto>
{
  constructor(
    @Inject(OPORTUNIDAD_PROYECTO_REPOSITORY)
    private readonly repositorio: IOportunidadProyectoRepository,
  ) {}

  execute(query: ObtenerDetalleOportunidadQuery): Observable<OportunidadProyecto> {
    return this.repositorio.obtenerDetalle(query.id);
  }
}
