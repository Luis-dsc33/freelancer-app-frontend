import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { CONTRATO_REPOSITORY, IContratoRepository } from '../data/contrato.repository';
import { FinalizarContratoCommand } from './finalizar-contrato.command';

@Injectable()
export class FinalizarContratoHandler
  implements ICommandHandler<FinalizarContratoCommand, void>
{
  constructor(
    @Inject(CONTRATO_REPOSITORY)
    private readonly repositorio: IContratoRepository,
  ) {}

  execute(command: FinalizarContratoCommand): Observable<void> {
    return this.repositorio.finalizarContrato(command.contratoId);
  }
}
