import { ICommand } from '../../../core/cqrs/command';

/** Command CQRS: finalizar un contrato activo en el que participa el estudiante. */
export class FinalizarContratoCommand implements ICommand<void> {
  declare readonly __result?: void;
  constructor(public readonly contratoId: string) {}
}
