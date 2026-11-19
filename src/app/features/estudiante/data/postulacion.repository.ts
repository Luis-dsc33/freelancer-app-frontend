import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearPostulacionRequest, PostulacionEstudiante } from '../models/postulacion';

/** Abstracción de acceso a postulaciones del estudiante en Marketplace.Api (DIP). */
export interface IPostulacionRepository {
  postularAOferta(ofertaId: string, request: CrearPostulacionRequest): Observable<PostulacionEstudiante>;
  listarMisPostulaciones(): Observable<PostulacionEstudiante[]>;
  retirarPostulacion(postulacionId: string): Observable<void>;
}

export const POSTULACION_REPOSITORY =
  new InjectionToken<IPostulacionRepository>('POSTULACION_REPOSITORY');
