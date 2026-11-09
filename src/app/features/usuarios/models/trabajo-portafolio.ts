export interface TrabajoPortafolio {
  id: string;
  titulo: string;
  descripcion: string;
  enlace: string | null;
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface GuardarTrabajoPortafolioRequest {
  titulo: string;
  descripcion: string;
  enlace: string | null;
}

export interface ErrorPortafolio {
  error?: string;
  errores?: { campo: string; mensaje: string }[];
}
