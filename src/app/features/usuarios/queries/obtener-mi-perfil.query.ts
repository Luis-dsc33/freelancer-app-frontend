import { IQuery } from '../../../core/cqrs/query';
import { PerfilEstudiante } from '../models/perfil';

/** Query CQRS: obtener el perfil del estudiante autenticado. */
export class ObtenerMiPerfilQuery implements IQuery<PerfilEstudiante> {}
