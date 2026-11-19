import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { IResenaRepository, RESENA_REPOSITORY } from '../data/resena.repository';
import { ResenaCreada } from '../models/resena';
import { CalificarClienteCommand } from './calificar-cliente.command';

@Injectable()
export class CalificarClienteHandler
  implements ICommandHandler<CalificarClienteCommand, ResenaCreada>
{
  constructor(
    @Inject(RESENA_REPOSITORY)
    private readonly repositorio: IResenaRepository,
  ) {}

  execute(command: CalificarClienteCommand): Observable<ResenaCreada> {
    return this.repositorio.calificarCliente(command.contratoId, {
      puntuacion: command.puntuacion,
      comentario: command.comentario.trim(),
    });
  }
}
