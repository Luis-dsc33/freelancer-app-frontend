import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';
import { IOportunidadProyectoRepository } from './oportunidad-proyecto.repository';

/**
 * Adaptador HTTP hacia Marketplace.Api.
 * Controller route: /api/Proyectos
 */
@Injectable()
export class OportunidadProyectoHttpRepository implements IOportunidadProyectoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/Proyectos`;

  listarOportunidades(): Observable<OportunidadProyecto[]> {
    return this.http.get<OportunidadProyecto[]>(this.baseUrl);
  }
}
