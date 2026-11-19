export interface ResenaRecibida {
  id: string;
  contratoId: string;
  autorId: string;
  nombreAutor?: string;
  puntuacion: number;
  comentario: string;
  creadaEn: string;
}

export interface ReputacionUsuario {
  usuarioId: string;
  promedio: number;
  totalResenas: number;
  resenas: ResenaRecibida[];
}
