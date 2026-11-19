export interface CalificarClienteRequest {
  puntuacion: number;
  comentario: string;
}

export interface ResenaCreada {
  id: string;
  contratoId: string;
  autorId: string;
  destinatarioId: string;
  puntuacion: number;
  comentario: string;
  creadaEn: string;
}
