import { IQuery } from '../../../core/cqrs/query';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';

/** Query CQRS: listar oportunidades abiertas del marketplace. */
export class ListarOportunidadesQuery implements IQuery<OportunidadProyecto[]> {}
