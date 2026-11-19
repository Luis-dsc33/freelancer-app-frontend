import { IQuery } from '../../../core/cqrs/query';
import { MensajeChat } from '../models/chat';

/** Query CQRS: obtener historial de mensajes de una conversación. */
export class ListarMensajesConversacionQuery implements IQuery<MensajeChat[]> {
  declare readonly __result?: MensajeChat[];
  constructor(public readonly conversacionId: string) {}
}
