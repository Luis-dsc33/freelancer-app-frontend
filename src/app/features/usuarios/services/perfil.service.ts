import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PerfilEstudiante } from '../models/perfil';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private baseUrl = `${environment.gatewayUrl}/api/usuarios/Perfiles`;

  constructor(private http: HttpClient) {}

  getMiPerfil(): Observable<PerfilEstudiante> {
    return this.http.get<PerfilEstudiante>(`${this.baseUrl}/mi-perfil`);
  }

  guardarPerfil(perfil: Partial<PerfilEstudiante>): Observable<any> {
    return this.http.post(`${this.baseUrl}/mi-perfil`, perfil);
  }
}
