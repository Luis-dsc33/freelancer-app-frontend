import { IQuery } from '../../../core/cqrs/query';
import { ContratoEstudiante } from '../models/contrato';

/** Query CQRS: listar los contratos en los que participa el estudiante autenticado. */
export class ListarMisContratosQuery implements IQuery<ContratoEstudiante[]> {}
