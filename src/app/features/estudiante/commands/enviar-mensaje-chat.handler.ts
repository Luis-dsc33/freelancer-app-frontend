import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { CHAT_REPOSITORY, IChatRepository } from '../data/chat.repository';
import { MensajeChat } from '../models/chat';
import { EnviarMensajeChatCommand } from './enviar-mensaje-chat.command';

@Injectable()
export class EnviarMensajeChatHandler
  implements ICommandHandler<EnviarMensajeChatCommand, MensajeChat>
{
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly repositorio: IChatRepository,
  ) {}

  execute(command: EnviarMensajeChatCommand): Observable<MensajeChat> {
    return this.repositorio.enviarMensaje(command.conversacionId, {
      contenido: command.contenido.trim(),
    });
  }
}
