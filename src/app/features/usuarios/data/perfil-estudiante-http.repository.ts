import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GuardarPerfilEstudiantePayload, PerfilEstudiante } from '../models/perfil';
import { CategoriaSkill, SkillCatalogo } from '../models/catalogo-skill';
import { ReputacionUsuario } from '../models/reputacion';
import { IPerfilEstudianteRepository } from './perfil-estudiante.repository';

/**
 * Adaptador HTTP para Perfil del Estudiante (`Usuarios.Api`),
 * Catálogo oficial (`Marketplace.Api`) y Reputación (`Resenas.Api`).
 */
@Injectable()
export class PerfilEstudianteHttpRepository implements IPerfilEstudianteRepository {
  private readonly http = inject(HttpClient);
  private readonly perfilesUrl = `${environment.gatewayUrl}/api/usuarios/Perfiles/mi-perfil`;
  private readonly catalogoUrl = `${environment.gatewayUrl}/api/marketplace/catalogo/habilidades`;
  private readonly resenasUrl = `${environment.gatewayUrl}/api/resenas`;

  obtenerMiPerfil(): Observable<PerfilEstudiante> {
    return this.http.get<PerfilEstudiante>(this.perfilesUrl);
  }

  guardarMiPerfil(
    payload: GuardarPerfilEstudiantePayload,
    actualizar: boolean,
  ): Observable<PerfilEstudiante | void> {
    return actualizar
      ? this.http.put<PerfilEstudiante | void>(this.perfilesUrl, payload)
      : this.http.post<PerfilEstudiante | void>(this.perfilesUrl, payload);
  }

  listarCategoriasSkills(): Observable<CategoriaSkill[]> {
    return this.http.get<CategoriaSkill[]>(`${this.catalogoUrl}/categorias`);
  }

  listarSkills(categoriaId?: string): Observable<SkillCatalogo[]> {
    const params = categoriaId
      ? new HttpParams().set('categoriaId', categoriaId)
      : undefined;
    return this.http.get<SkillCatalogo[]>(this.catalogoUrl, { params });
  }

  obtenerReputacion(usuarioId: string): Observable<ReputacionUsuario> {
    return this.http.get<ReputacionUsuario>(
      `${this.resenasUrl}/usuarios/${encodeURIComponent(usuarioId)}/reputacion`,
    );
  }
}
