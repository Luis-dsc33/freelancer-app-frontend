import { ICommand } from '../../../core/cqrs/command';
import { ResenaCreada } from '../models/resena';

/** Command CQRS: calificar al cliente de un contrato finalizado. */
export class CalificarClienteCommand implements ICommand<ResenaCreada> {
  declare readonly __result?: ResenaCreada;
  constructor(
    public readonly contratoId: string,
    public readonly puntuacion: number,
    public readonly comentario: string,
  ) {}
}
