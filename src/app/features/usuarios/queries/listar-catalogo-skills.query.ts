import { IQuery } from '../../../core/cqrs/query';
import { CatalogoSkillsData } from '../models/catalogo-skill';

/** Query CQRS: obtener categorías y habilidades activas del catálogo oficial. */
export class ListarCatalogoSkillsQuery implements IQuery<CatalogoSkillsData> {
  declare readonly __result?: CatalogoSkillsData;
  constructor(public readonly categoriaId?: string) {}
}
