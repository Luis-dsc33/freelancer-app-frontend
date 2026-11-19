import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICommandHandler } from '../../../core/cqrs/command-handler';
import { PerfilEstudiante } from '../models/perfil';
import {
  IPerfilEstudianteRepository,
  PERFIL_ESTUDIANTE_REPOSITORY,
} from '../data/perfil-estudiante.repository';
import { GuardarMiPerfilCommand } from './guardar-mi-perfil.command';

@Injectable()
export class GuardarMiPerfilHandler
  implements ICommandHandler<GuardarMiPerfilCommand, PerfilEstudiante | void>
{
  constructor(
    @Inject(PERFIL_ESTUDIANTE_REPOSITORY)
    private readonly repositorio: IPerfilEstudianteRepository,
  ) {}

  execute(command: GuardarMiPerfilCommand): Observable<PerfilEstudiante | void> {
    return this.repositorio.guardarMiPerfil(command.payload, command.actualizar);
  }
}
