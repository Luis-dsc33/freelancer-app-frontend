import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { IPostulacionRepository, POSTULACION_REPOSITORY } from '../data/postulacion.repository';
import { PostulacionEstudiante } from '../models/postulacion';
import { ListarMisPostulacionesQuery } from './listar-mis-postulaciones.query';

@Injectable()
export class ListarMisPostulacionesHandler
  implements IQueryHandler<ListarMisPostulacionesQuery, PostulacionEstudiante[]>
{
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly repositorio: IPostulacionRepository,
  ) {}

  execute(_query: ListarMisPostulacionesQuery): Observable<PostulacionEstudiante[]> {
    return this.repositorio.listarMisPostulaciones();
  }
}
