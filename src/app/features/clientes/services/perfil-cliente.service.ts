import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PerfilCliente } from '../models/oferta-cliente';

@Injectable({ providedIn: 'root' })
export class PerfilClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/usuarios/clientes/mi-perfil`;

  obtenerPerfil(): Observable<PerfilCliente> {
    return this.http.get<PerfilCliente>(this.baseUrl);
  }

  crearPerfil(perfil: PerfilCliente): Observable<void> {
    return this.http.post<void>(this.baseUrl, perfil);
  }

  actualizarPerfil(perfil: PerfilCliente): Observable<void> {
    return this.http.put<void>(this.baseUrl, perfil);
  }
}
