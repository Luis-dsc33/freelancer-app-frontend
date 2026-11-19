import { ICommand } from '../../../core/cqrs/command';
import { PostulacionEstudiante } from '../models/postulacion';

/** Command CQRS: enviar una postulación a una oportunidad abierta. */
export class PostularAOfertaCommand implements ICommand<PostulacionEstudiante> {
  declare readonly __result?: PostulacionEstudiante;
  constructor(
    public readonly ofertaId: string,
    public readonly mensaje: string,
  ) {}
}
