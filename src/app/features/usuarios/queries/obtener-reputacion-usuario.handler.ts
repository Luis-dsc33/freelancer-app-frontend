import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { ReputacionUsuario } from '../models/reputacion';
import {
  IPerfilEstudianteRepository,
  PERFIL_ESTUDIANTE_REPOSITORY,
} from '../data/perfil-estudiante.repository';
import { ObtenerReputacionUsuarioQuery } from './obtener-reputacion-usuario.query';

@Injectable()
export class ObtenerReputacionUsuarioHandler
  implements IQueryHandler<ObtenerReputacionUsuarioQuery, ReputacionUsuario>
{
  constructor(
    @Inject(PERFIL_ESTUDIANTE_REPOSITORY)
    private readonly repositorio: IPerfilEstudianteRepository,
  ) {}

  execute(query: ObtenerReputacionUsuarioQuery): Observable<ReputacionUsuario> {
    return this.repositorio.obtenerReputacion(query.usuarioId);
  }
}
