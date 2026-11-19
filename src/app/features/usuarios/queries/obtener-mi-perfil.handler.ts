import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { PerfilEstudiante } from '../models/perfil';
import {
  IPerfilEstudianteRepository,
  PERFIL_ESTUDIANTE_REPOSITORY,
} from '../data/perfil-estudiante.repository';
import { ObtenerMiPerfilQuery } from './obtener-mi-perfil.query';

@Injectable()
export class ObtenerMiPerfilHandler
  implements IQueryHandler<ObtenerMiPerfilQuery, PerfilEstudiante>
{
  constructor(
    @Inject(PERFIL_ESTUDIANTE_REPOSITORY)
    private readonly repositorio: IPerfilEstudianteRepository,
  ) {}

  execute(_query: ObtenerMiPerfilQuery): Observable<PerfilEstudiante> {
    return this.repositorio.obtenerMiPerfil();
  }
}
