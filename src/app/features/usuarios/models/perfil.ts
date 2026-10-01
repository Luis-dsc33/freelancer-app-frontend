export interface PerfilEstudiante {
  id?: string | null;
  usuarioId?: string;
  carrera: string;
  habilidades: string[];
  descripcion: string;
  esPerfilCompleto?: boolean;
  camposObligatorios?: string[];
  camposFaltantes?: string[];
}
