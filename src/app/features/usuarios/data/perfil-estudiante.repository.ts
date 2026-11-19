import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { GuardarPerfilEstudiantePayload, PerfilEstudiante } from '../models/perfil';
import { CategoriaSkill, SkillCatalogo } from '../models/catalogo-skill';
import { ReputacionUsuario } from '../models/reputacion';

/** Abstracción de acceso al perfil del estudiante, catálogo de skills y reputación (DIP). */
export interface IPerfilEstudianteRepository {
  obtenerMiPerfil(): Observable<PerfilEstudiante>;
  guardarMiPerfil(payload: GuardarPerfilEstudiantePayload, actualizar: boolean): Observable<PerfilEstudiante | void>;
  listarCategoriasSkills(): Observable<CategoriaSkill[]>;
  listarSkills(categoriaId?: string): Observable<SkillCatalogo[]>;
  obtenerReputacion(usuarioId: string): Observable<ReputacionUsuario>;
}

export const PERFIL_ESTUDIANTE_REPOSITORY =
  new InjectionToken<IPerfilEstudianteRepository>('PERFIL_ESTUDIANTE_REPOSITORY');
