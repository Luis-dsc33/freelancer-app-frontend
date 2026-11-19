import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ContratoCliente,
  OfertaCliente,
  PostulacionCliente,
  PublicarOfertaRequest,
} from '../models/oferta-cliente';

@Injectable({ providedIn: 'root' })
export class OfertasClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/Proyectos`;

  publicarOferta(datos: PublicarOfertaRequest): Observable<OfertaCliente> {
    return this.http.post<OfertaCliente>(this.baseUrl, datos);
  }

  listarMisOfertas(): Observable<OfertaCliente[]> {
    return this.http.get<OfertaCliente[]>(`${this.baseUrl}/mis-ofertas`);
  }

  actualizarOferta(id: string, datos: PublicarOfertaRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${encodeURIComponent(id)}`, datos);
  }

  cerrarOferta(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${encodeURIComponent(id)}/cerrar`, {});
  }

  eliminarOferta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  listarPostulaciones(ofertaId: string): Observable<PostulacionCliente[]> {
    return this.http.get<PostulacionCliente[]>(
      `${environment.gatewayUrl}/api/ofertas/${encodeURIComponent(ofertaId)}/postulaciones`,
    );
  }

  aceptarPostulacion(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/postulaciones/${encodeURIComponent(id)}/aceptar`,
      {},
    );
  }

  rechazarPostulacion(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/postulaciones/${encodeURIComponent(id)}/rechazar`,
      {},
    );
  }

  crearContrato(postulacionId: string): Observable<unknown> {
    return this.http.post(`${environment.gatewayUrl}/api/contratos`, { postulacionId });
  }

  listarMisContratos(): Observable<ContratoCliente[]> {
    return this.http.get<ContratoCliente[]>(`${environment.gatewayUrl}/api/contratos/mis-contratos`);
  }

  finalizarContrato(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/contratos/${encodeURIComponent(id)}/finalizar`,
      {},
    );
  }

  cancelarContrato(id: string): Observable<void> {
    return this.http.put<void>(
      `${environment.gatewayUrl}/api/contratos/${encodeURIComponent(id)}/cancelar`,
      {},
    );
  }
}
