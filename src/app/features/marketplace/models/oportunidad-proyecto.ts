export type TipoRequisitoSkill = 'Requerida' | 'Deseable';

export interface ProyectoSkill {
  skillId: string;
  nombreSkill: string;
  tipoRequisito: TipoRequisitoSkill;
}

export interface HitoPagoProyecto {
  titulo: string;
  porcentaje: number;
  monto?: number | null;
  descripcion?: string | null;
}

/** Oportunidad de proyecto publicada en el marketplace (ProyectoMapper.ToDto). */
export interface OportunidadProyecto {
  id: string;
  titulo: string;
  descripcion: string;
  presupuesto: number;
  esUrgente: boolean;
  habilidadesRequeridas: string[];
  nombreCliente: string;
  estado: string;
  creadoEn: string;
  clienteId?: string;
  disciplina?: string | null;
  presupuestoMinimo?: number | null;
  presupuestoMaximo?: number | null;
  tipoPresupuesto?: string | null;
  moneda?: string | null;
  esquemaPago?: string | null;
  hitosPago?: HitoPagoProyecto[];
  fechaLimite?: string | null;
  fechaEntregaEstimada?: string | null;
  modalidad?: string | null;
  ubicacion?: string | null;
  alcance?: string | null;
  habilidadesDeseables?: string[];
  skills?: ProyectoSkill[];
  entregables?: string[];
  nivelAvance?: string | null;
  nivelAcademicoSugerido?: string | null;
  requierePortafolio?: boolean;
  dedicacionSemanalEstimada?: string | null;
  flexibilidadHorario?: boolean | string | null;
  cantidadVacantes?: number | null;
  permitePortafolioPublico?: boolean;
  requiereConfidencialidad?: boolean;
  propiedadIntelectual?: string | null;
  yaPostulado?: boolean;
}

export interface FiltrosMarketplace {
  busqueda?: string;
  disciplina?: string;
  modalidad?: string;
  presupuestoMin?: number | null;
  presupuestoMax?: number | null;
  soloUrgentes?: boolean;
  skillIds?: string[];
  habilidad?: string;
  page?: number;
  pageSize?: number;
}

export interface RespuestaPaginadaOportunidades {
  items: OportunidadProyecto[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

export interface ErrorMarketplace {
  error?: string;
  errores?: { campo: string; mensaje: string }[];
}
