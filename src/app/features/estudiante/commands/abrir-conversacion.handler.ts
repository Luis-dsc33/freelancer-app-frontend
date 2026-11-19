import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { CHAT_REPOSITORY, IChatRepository } from '../data/chat.repository';
import { ConversacionChat } from '../models/chat';
import { AbrirConversacionCommand } from './abrir-conversacion.command';

@Injectable()
export class AbrirConversacionHandler
  implements ICommandHandler<AbrirConversacionCommand, ConversacionChat>
{
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly repositorio: IChatRepository,
  ) {}

  execute(command: AbrirConversacionCommand): Observable<ConversacionChat> {
    return this.repositorio.abrirConversacion(command.request);
  }
}
