export interface PublicarOfertaRequest {
  titulo: string;
  descripcion: string;
  disciplina: string;
  presupuesto: number;
  fechaLimite: string;
}
export interface OfertaCliente extends PublicarOfertaRequest {
  id: string;
  presupuesto: number;
  estado: string;
  creadoEn?: string;
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
