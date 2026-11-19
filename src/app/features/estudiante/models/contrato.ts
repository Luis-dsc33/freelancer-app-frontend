export type EstadoContrato = 'Activo' | 'Finalizado' | 'Cancelado';

export interface ContratoEstudiante {
  id: string;
  postulacionId: string;
  proyectoId: string;
  clienteId: string;
  estudianteId: string;
  importeAcordado: number;
  fechaInicio: string;
  fechaCompromiso: string;
  estado: EstadoContrato;
  creadoEn: string;
  cerradoEn?: string | null;
  tituloProyecto?: string;
  nombreCliente?: string;
  yaCalificadoPorEstudiante?: boolean;
}
