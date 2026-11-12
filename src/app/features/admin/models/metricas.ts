// Equivalente en el back: Admin.Application/Queries/ObtenerMetricas/MetricasPanelDto + Dtos/EstadisticasDtos.cs

export interface Conteo {
  etiqueta: string;
  total: number;
}

export interface ConteoSemanal {
  inicioSemana: string; // yyyy-MM-dd (lunes)
  total: number;
}

export interface EstadisticasUsuarios {
  totalEstudiantes: number;
  totalClientes: number;
  cuentasSuspendidas: number;
  registrosPorSemana: ConteoSemanal[];
}

export interface EmbudoPostulaciones {
  enviadas: number;
  enRevision: number;
  aceptadas: number;
  noSeleccionadas: number;
}

export interface EstadisticasMarketplace {
  ofertasDisponibles: number;
  ofertasPorDisciplina: Conteo[];
  ofertasPorSemana: ConteoSemanal[];
  postulaciones: EmbudoPostulaciones;
}

export interface EstadisticasResenas {
  totalCalificaciones: number;
  promedioGeneral: number | null;
  distribucionEstrellas: Conteo[];
}

export interface EstadisticasCasos {
  recibidos: number;
  enRevision: number;
  pendientesInformacion: number;
  cerrados: number;
  diasPromedioCierre: number | null;
}

// Una sección en null = su servicio no respondió (HU-28-02: "No disponible")
export interface MetricasPanel {
  fechaCorte: string;
  esDemostracion: boolean;
  usuarios: EstadisticasUsuarios | null;
  marketplace: EstadisticasMarketplace | null;
  resenas: EstadisticasResenas | null;
  casos: EstadisticasCasos | null;
}
