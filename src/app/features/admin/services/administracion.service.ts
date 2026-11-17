// ADMIN Marcos: un método por cada Command/Query de Admin.Api para Usuarios, Moderación y Bitácora.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AccionAdministrativa, Bitacora, FiltrosBitacora, FiltrosUsuarios, Moderacion, PaginaUsuarios,
} from '../models/administracion';

@Injectable({ providedIn: 'root' })
export class AdministracionService {
  private readonly http = inject(HttpClient);
  // /api/admin = prefijo del Gateway → Admin.Api
  private readonly base = `${environment.gatewayUrl}/api/admin`;

  // ── HU-25 ──
  buscarUsuarios(f: FiltrosUsuarios): Observable<PaginaUsuarios> {
    return this.http.get<PaginaUsuarios>(`${this.base}/Usuarios`, { params: this.params({ ...f, tamanoPagina: 10 }) });
  }

  historialUsuario(id: string): Observable<AccionAdministrativa[]> {
    return this.http.get<AccionAdministrativa[]>(`${this.base}/Usuarios/${id}/historial`);
  }

  // ── HU-21 / HU-26 ──
  suspender(id: string, motivo: string): Observable<AccionAdministrativa> {
    return this.http.post<AccionAdministrativa>(`${this.base}/Usuarios/${id}/suspender`, { motivo });
  }

  reactivar(id: string, motivo: string): Observable<AccionAdministrativa> {
    return this.http.post<AccionAdministrativa>(`${this.base}/Usuarios/${id}/reactivar`, { motivo });
  }

  obtenerModeracion(): Observable<Moderacion> {
    return this.http.get<Moderacion>(`${this.base}/Moderacion`);
  }

  ocultarOferta(id: string, motivo: string): Observable<AccionAdministrativa> {
    return this.http.post<AccionAdministrativa>(`${this.base}/Moderacion/ofertas/${id}/ocultar`, { motivo });
  }

  restaurarOferta(id: string, motivo: string): Observable<AccionAdministrativa> {
    return this.http.post<AccionAdministrativa>(`${this.base}/Moderacion/ofertas/${id}/restaurar`, { motivo });
  }

  // ── HU-27 ──
  obtenerBitacora(f: FiltrosBitacora): Observable<Bitacora> {
    return this.http.get<Bitacora>(`${this.base}/Bitacora`, { params: this.params(f) });
  }

  // Mensaje legible del backend: {error} o el primer error de validación
  mensajeDeError(err: HttpErrorResponse): string {
    if (err.status === 401 || err.status === 403) return 'Tu sesión no tiene permisos de Administrador.';
    return err.error?.error ?? err.error?.errores?.[0]?.mensaje ?? 'No se pudo completar la operación. Intenta de nuevo.';
  }

  private params(valores: object): HttpParams {
    let p = new HttpParams();
    for (const [clave, valor] of Object.entries(valores)) {
      if (valor !== undefined && valor !== null && valor !== '') p = p.set(clave, String(valor));
    }
    return p;
  }
}
