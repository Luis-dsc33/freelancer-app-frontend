import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';
import {
  IOportunidadProyectoRepository,
  OPORTUNIDAD_PROYECTO_REPOSITORY,
} from '../data/oportunidad-proyecto.repository';
import { ListarOportunidadesQuery } from './listar-oportunidades.query';

@Injectable()
export class ListarOportunidadesHandler
  implements IQueryHandler<ListarOportunidadesQuery, OportunidadProyecto[]>
{
  constructor(
    @Inject(OPORTUNIDAD_PROYECTO_REPOSITORY)
    private readonly repositorio: IOportunidadProyectoRepository,
  ) {}

  execute(_query: ListarOportunidadesQuery): Observable<OportunidadProyecto[]> {
    return this.repositorio.listarOportunidades();
  }
}
