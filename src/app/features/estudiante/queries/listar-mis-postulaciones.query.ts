import { IQuery } from '../../../core/cqrs/query';
import { PostulacionEstudiante } from '../models/postulacion';

/** Query CQRS: listar las postulaciones enviadas por el estudiante autenticado. */
export class ListarMisPostulacionesQuery implements IQuery<PostulacionEstudiante[]> {}
