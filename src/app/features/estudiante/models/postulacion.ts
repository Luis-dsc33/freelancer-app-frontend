export type EstadoPostulacion = 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Retirada';

export interface PostulacionEstudiante {
  id: string;
  proyectoId: string;
  estudianteId: string;
  mensaje: string;
  estado: EstadoPostulacion;
  creadaEn: string;
  resueltaEn?: string | null;
  tituloProyecto?: string;
  disciplinaProyecto?: string;
  modalidadProyecto?: string;
  presupuestoProyecto?: number | null;
  nombreCliente?: string;
  estadoProyecto?: string;
  contratoId?: string | null;
}

export interface CrearPostulacionRequest {
  mensaje: string;
}
