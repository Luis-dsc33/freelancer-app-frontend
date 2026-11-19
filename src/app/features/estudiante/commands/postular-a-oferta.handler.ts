import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { IPostulacionRepository, POSTULACION_REPOSITORY } from '../data/postulacion.repository';
import { PostulacionEstudiante } from '../models/postulacion';
import { PostularAOfertaCommand } from './postular-a-oferta.command';

@Injectable()
export class PostularAOfertaHandler
  implements ICommandHandler<PostularAOfertaCommand, PostulacionEstudiante>
{
  constructor(
    @Inject(POSTULACION_REPOSITORY)
    private readonly repositorio: IPostulacionRepository,
  ) {}

  execute(command: PostularAOfertaCommand): Observable<PostulacionEstudiante> {
    return this.repositorio.postularAOferta(command.ofertaId, {
      mensaje: command.mensaje.trim(),
    });
  }
}
