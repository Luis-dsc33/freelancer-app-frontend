import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CalificarEstudianteRequest, ResenaEmitidaCliente } from '../models/resena-cliente';

/** Reseñas del Cliente (Resenas.Api vía gateway). El autor y el destinatario los resuelve el backend. */
@Injectable({ providedIn: 'root' })
export class ResenasClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/resenas`;

  /** Cliente → Estudiante (contrato en estado `Finalizado`). */
  calificarEstudiante(
    contratoId: string,
    request: CalificarEstudianteRequest,
  ): Observable<ResenaEmitidaCliente> {
    return this.http.post<ResenaEmitidaCliente>(
      `${this.baseUrl}/contratos/${encodeURIComponent(contratoId)}/estudiante`,
      request,
    );
  }

  /** Reseñas que yo ya emití: sirve para ocultar «Calificar» y evitar `409 Conflict`. */
  listarMisResenasEmitidas(): Observable<ResenaEmitidaCliente[]> {
    return this.http.get<ResenaEmitidaCliente[]>(`${this.baseUrl}/mis-resenas-emitidas`);
  }
}
