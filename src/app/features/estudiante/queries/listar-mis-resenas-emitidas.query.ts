import { IQuery } from '../../../core/cqrs/query';
import { ResenaCreada } from '../models/resena';

/** Query CQRS: listar reseñas emitidas por el estudiante para identificar contratos ya calificados. */
export class ListarMisResenasEmitidasQuery implements IQuery<ResenaCreada[]> {}
