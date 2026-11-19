import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { CHAT_REPOSITORY, IChatRepository } from '../data/chat.repository';
import { MensajeChat } from '../models/chat';
import { ListarMensajesConversacionQuery } from './listar-mensajes-conversacion.query';

@Injectable()
export class ListarMensajesConversacionHandler
  implements IQueryHandler<ListarMensajesConversacionQuery, MensajeChat[]>
{
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly repositorio: IChatRepository,
  ) {}

  execute(query: ListarMensajesConversacionQuery): Observable<MensajeChat[]> {
    return this.repositorio.listarMensajes(query.conversacionId);
  }
}
