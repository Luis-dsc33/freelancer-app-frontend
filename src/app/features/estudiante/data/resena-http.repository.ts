import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CalificarClienteRequest, ResenaCreada } from '../models/resena';
import { IResenaRepository } from './resena.repository';

/** Adaptador HTTP hacia Resenas.Api. */
@Injectable()
export class ResenaHttpRepository implements IResenaRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/resenas`;

  calificarCliente(
    contratoId: string,
    request: CalificarClienteRequest,
  ): Observable<ResenaCreada> {
    return this.http.post<ResenaCreada>(
      `${this.baseUrl}/contratos/${encodeURIComponent(contratoId)}/cliente`,
      request,
    );
  }

  listarMisResenasEmitidas(): Observable<ResenaCreada[]> {
    return this.http.get<ResenaCreada[]>(`${this.baseUrl}/mis-resenas-emitidas`);
  }
}
