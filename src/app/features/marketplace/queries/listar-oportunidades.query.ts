import { IQuery } from '../../../core/cqrs/query';
import { FiltrosMarketplace, OportunidadProyecto } from '../models/oportunidad-proyecto';

/** Query CQRS: listar oportunidades abiertas del marketplace con filtros opcionales. */
export class ListarOportunidadesQuery implements IQuery<OportunidadProyecto[]> {
  declare readonly __result?: OportunidadProyecto[];
  constructor(public readonly filtros?: FiltrosMarketplace) {}
}
