import { ICommand } from '../../../core/cqrs/command';
import { GuardarPerfilEstudiantePayload, PerfilEstudiante } from '../models/perfil';

/** Command CQRS: crear o actualizar el perfil del estudiante autenticado. */
export class GuardarMiPerfilCommand implements ICommand<PerfilEstudiante | void> {
  declare readonly __result?: PerfilEstudiante | void;
  constructor(
    public readonly payload: GuardarPerfilEstudiantePayload,
    public readonly actualizar: boolean,
  ) {}
}
