export interface CalificarEstudianteRequest {
  /** Entero entre 1 y 5. */
  puntuacion: number;
  /** Obligatorio, no solo espacios, máx. 2000 caracteres. */
  comentario: string;
}

export interface ResenaEmitidaCliente {
  id: string;
  contratoId: string;
  autorId: string;
  destinatarioId: string;
  puntuacion: number;
  comentario: string;
  creadaEn: string;
}
