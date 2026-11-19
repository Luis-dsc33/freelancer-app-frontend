import { ICommand } from '../../../core/cqrs/command';

/** Command CQRS: cancelar un contrato activo del estudiante. */
export class CancelarContratoCommand implements ICommand<void> {
  declare readonly __result?: void;
  constructor(public readonly contratoId: string) {}
}
