import { IQuery } from '../../../core/cqrs/query';
import { ConversacionChat } from '../models/chat';

/** Query CQRS: listar las conversaciones activas del estudiante. */
export class ListarMisConversacionesQuery implements IQuery<ConversacionChat[]> {}
