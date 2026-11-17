/** Oportunidad de proyecto publicada en el marketplace. */
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
}

export interface ErrorMarketplace {
  error?: string;
  errores?: { campo: string; mensaje: string }[];
}
