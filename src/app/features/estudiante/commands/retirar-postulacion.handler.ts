import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { IPostulacionRepository, POSTULACION_REPOSITORY } from '../data/postulacion.repository';
import { RetirarPostulacionCommand } from './retirar-postulacion.command';

@Injectable()
export class RetirarPostulacionHandler
  implements ICommandHandler<RetirarPostulacionCommand, void>
{
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly repositorio: IPostulacionRepository,
  ) {}

  execute(command: RetirarPostulacionCommand): Observable<void> {
    return this.repositorio.retirarPostulacion(command.postulacionId);
  }
}
