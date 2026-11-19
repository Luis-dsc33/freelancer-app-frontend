import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { IQueryHandler } from '../../../core/cqrs/query-handler';
import { CatalogoSkillsData } from '../models/catalogo-skill';
import {
  IPerfilEstudianteRepository,
  PERFIL_ESTUDIANTE_REPOSITORY,
} from '../data/perfil-estudiante.repository';
import { ListarCatalogoSkillsQuery } from './listar-catalogo-skills.query';

@Injectable()
export class ListarCatalogoSkillsHandler
  implements IQueryHandler<ListarCatalogoSkillsQuery, CatalogoSkillsData>
{
  constructor(
    @Inject(PERFIL_ESTUDIANTE_REPOSITORY)
    private readonly repositorio: IPerfilEstudianteRepository,
  ) {}

  execute(query: ListarCatalogoSkillsQuery): Observable<CatalogoSkillsData> {
    return forkJoin({
      categorias: this.repositorio.listarCategoriasSkills(),
      skills: this.repositorio.listarSkills(query.categoriaId),
    });
  }
}
