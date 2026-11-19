import { ICommand } from '../../../core/cqrs/command';

/** Command CQRS: retirar una postulación pendiente del estudiante. */
export class RetirarPostulacionCommand implements ICommand<void> {
  declare readonly __result?: void;
  constructor(public readonly postulacionId: string) {}
}
