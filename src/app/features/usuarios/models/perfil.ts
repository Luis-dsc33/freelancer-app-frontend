export type NivelDominioSkill = 'Basico' | 'Intermedio' | 'Avanzado';

export interface EstudianteSkill {
  skillId: string;
  nombreSkill: string;
  categoria?: string;
  nivelDominio: NivelDominioSkill;
}

export interface PerfilEstudiante {
  id?: string | null;
  usuarioId?: string;
  nombre?: string;
  carrera: string;
  habilidades: string[];
  skillsCatalogo?: EstudianteSkill[];
  descripcion: string;
  esPerfilCompleto?: boolean;
  camposObligatorios?: string[];
  camposFaltantes?: string[];
  calificacionPromedio?: number | null;
  totalResenas?: number;
}

export interface SkillPerfilInput {
  skillId: string;
  nombreSkill: string;
  nivelDominio: NivelDominioSkill;
}

export interface GuardarPerfilEstudiantePayload {
  carrera: string;
  descripcion: string;
  habilidades: string[];
  skillsCatalogo: SkillPerfilInput[];
}
