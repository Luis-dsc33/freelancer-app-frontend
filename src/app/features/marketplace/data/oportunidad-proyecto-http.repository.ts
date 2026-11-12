import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';
import { IOportunidadProyectoRepository } from './oportunidad-proyecto.repository';

/**
 * Adaptador HTTP hacia Marketplace.Api.
 * Gateway: /api/marketplace/ → marketplace-api:/
 * Controller esperado: api/Proyectos
 */
@Injectable()
export class OportunidadProyectoHttpRepository implements IOportunidadProyectoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/marketplace/api/Proyectos`;

  listarOportunidades(): Observable<OportunidadProyecto[]> {
    return this.http.get<OportunidadProyecto[]>(this.baseUrl);
  }
}
