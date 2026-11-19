import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContratoEstudiante } from '../models/contrato';
import { IContratoRepository } from './contrato.repository';

/**
 * Adaptador HTTP hacia Marketplace.Api (Contratos del Estudiante).
 */
@Injectable()
export class ContratoHttpRepository implements IContratoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/marketplace/contratos`;

  listarMisContratos(): Observable<ContratoEstudiante[]> {
    return this.http.get<ContratoEstudiante[]>(`${this.baseUrl}/mis-contratos`);
  }

  finalizarContrato(contratoId: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${encodeURIComponent(contratoId)}/finalizar`,
      {},
    );
  }

  cancelarContrato(contratoId: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${encodeURIComponent(contratoId)}/cancelar`,
      {},
    );
  }
}
