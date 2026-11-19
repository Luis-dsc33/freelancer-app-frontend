import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { IResenaRepository, RESENA_REPOSITORY } from '../data/resena.repository';
import { ResenaCreada } from '../models/resena';
import { ListarMisResenasEmitidasQuery } from './listar-mis-resenas-emitidas.query';

@Injectable()
export class ListarMisResenasEmitidasHandler
  implements IQueryHandler<ListarMisResenasEmitidasQuery, ResenaCreada[]>
{
  constructor(
    @Inject(RESENA_REPOSITORY)
    private readonly repositorio: IResenaRepository,
  ) {}

  execute(_query: ListarMisResenasEmitidasQuery): Observable<ResenaCreada[]> {
    return this.repositorio.listarMisResenasEmitidas();
  }
}
