import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { CHAT_REPOSITORY, IChatRepository } from '../data/chat.repository';
import { ConversacionChat } from '../models/chat';
import { ListarMisConversacionesQuery } from './listar-mis-conversaciones.query';

@Injectable()
export class ListarMisConversacionesHandler
  implements IQueryHandler<ListarMisConversacionesQuery, ConversacionChat[]>
{
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly repositorio: IChatRepository,
  ) {}

  execute(_query: ListarMisConversacionesQuery): Observable<ConversacionChat[]> {
    return this.repositorio.listarMisConversaciones();
  }
}
