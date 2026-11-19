import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { CONTRATO_REPOSITORY, IContratoRepository } from '../data/contrato.repository';
import { CancelarContratoCommand } from './cancelar-contrato.command';

@Injectable()
export class CancelarContratoHandler
  implements ICommandHandler<CancelarContratoCommand, void>
{
  constructor(
    @Inject(CONTRATO_REPOSITORY)
    private readonly repositorio: IContratoRepository,
  ) {}

  execute(command: CancelarContratoCommand): Observable<void> {
    return this.repositorio.cancelarContrato(command.contratoId);
  }
}
