import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { CONTRATO_REPOSITORY, IContratoRepository } from '../data/contrato.repository';
import { ContratoEstudiante } from '../models/contrato';
import { ListarMisContratosQuery } from './listar-mis-contratos.query';

@Injectable()
export class ListarMisContratosHandler
  implements IQueryHandler<ListarMisContratosQuery, ContratoEstudiante[]>
{
  constructor(
    @Inject(CONTRATO_REPOSITORY)
    private readonly repositorio: IContratoRepository,
  ) {}

  execute(_query: ListarMisContratosQuery): Observable<ContratoEstudiante[]> {
    return this.repositorio.listarMisContratos();
  }
}
