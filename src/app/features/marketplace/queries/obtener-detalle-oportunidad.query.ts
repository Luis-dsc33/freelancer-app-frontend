import { IQuery } from '../../../core/cqrs/query';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';

/** Query CQRS: obtener el detalle completo de una oportunidad del marketplace. */
export class ObtenerDetalleOportunidadQuery implements IQuery<OportunidadProyecto> {
  declare readonly __result?: OportunidadProyecto;
  constructor(public readonly id: string) {}
}
