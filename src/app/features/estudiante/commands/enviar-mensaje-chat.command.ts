import { ICommand } from '../../../core/cqrs/command';
import { MensajeChat } from '../models/chat';

/** Command CQRS: enviar un mensaje en una conversación activa. */
export class EnviarMensajeChatCommand implements ICommand<MensajeChat> {
  declare readonly __result?: MensajeChat;
  constructor(
    public readonly conversacionId: string,
    public readonly contenido: string,
  ) {}
}
