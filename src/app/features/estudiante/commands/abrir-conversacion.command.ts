import { ICommand } from '../../../core/cqrs/command';
import { AbrirConversacionRequest, ConversacionChat } from '../models/chat';

/** Command CQRS: abrir o recuperar la conversación con el cliente asociada a una postulación o contrato. */
export class AbrirConversacionCommand implements ICommand<ConversacionChat> {
  declare readonly __result?: ConversacionChat;
  constructor(public readonly request: AbrirConversacionRequest) {}
}
