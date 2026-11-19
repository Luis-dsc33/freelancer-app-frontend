import { IQuery } from '../../../core/cqrs/query';
import { ReputacionUsuario } from '../models/reputacion';

/** Query CQRS: consultar calificación promedio y reseñas recibidas del usuario. */
export class ObtenerReputacionUsuarioQuery implements IQuery<ReputacionUsuario> {
  declare readonly __result?: ReputacionUsuario;
  constructor(public readonly usuarioId: string) {}
}
