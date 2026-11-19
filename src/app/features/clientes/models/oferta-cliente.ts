export interface SkillCatalogoCliente {
  id: string;
  nombre: string;
  categoriaId?: string;
  categoriaNombre?: string;
  activo?: boolean;
}

export interface PublicarOfertaRequest {
  titulo: string;
  descripcion: string;
  disciplina: string;
  presupuesto: number;
  fechaLimite: string;
  habilidadesRequeridas?: string[];
  tipoPresupuesto?: number;
  moneda?: string;
  modalidad?: number;
  ubicacion?: string | null;
  esquemaPago?: number;
  requierePortafolio?: boolean;
  cantidadVacantes?: number;
}
export interface OfertaCliente extends PublicarOfertaRequest {
  id: string;
  presupuesto: number;
  estado: string;
  creadoEn?: string;
  skills?: { skillId: string; nombreSkill: string; tipoRequisito: string }[];
  habilidades?: { skillId: string; nombre: string; categoria?: string; tipoRequisito: string }[];
}

export interface PerfilCliente {
  nombreEmpresa: string;
  telefono: string;
  ubicacion: string;
  descripcion: string;
  datosContacto: string;
}

export interface PostulacionCliente {
  id: string;
  proyectoId: string;
  estudianteId: string;
  nombreEstudiante?: string;
  carrera?: string;
  mensaje?: string;
  estado: string;
  fechaPostulacion?: string;
}

export interface ContratoCliente {
  id: string;
  postulacionId: string;
  proyectoId: string;
  estudianteId: string;
  estado: string;
  creadoEn?: string;
}

export type CampoOfertaCliente = keyof PublicarOfertaRequest;
