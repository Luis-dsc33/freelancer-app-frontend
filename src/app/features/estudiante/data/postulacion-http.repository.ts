import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CrearPostulacionRequest, PostulacionEstudiante } from '../models/postulacion';
import { IPostulacionRepository } from './postulacion.repository';

/**
 * Adaptador HTTP hacia Marketplace.Api (Postulaciones del Estudiante).
 */
@Injectable()
export class PostulacionHttpRepository implements IPostulacionRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/marketplace`;

  postularAOferta(
    ofertaId: string,
    request: CrearPostulacionRequest,
  ): Observable<PostulacionEstudiante> {
    return this.http.post<PostulacionEstudiante>(
      `${this.baseUrl}/ofertas/${encodeURIComponent(ofertaId)}/postulaciones`,
      request,
    );
  }

  listarMisPostulaciones(): Observable<PostulacionEstudiante[]> {
    return this.http.get<PostulacionEstudiante[]>(
      `${this.baseUrl}/postulaciones/mis-postulaciones`,
    );
  }

  retirarPostulacion(postulacionId: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/postulaciones/${encodeURIComponent(postulacionId)}/retirar`,
      {},
    );
  }
}
