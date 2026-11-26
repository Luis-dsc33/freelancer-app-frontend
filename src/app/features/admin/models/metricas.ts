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

// Una sección en null = su servicio no respondió (HU-28-02: "No disponible")
export interface MetricasPanel {
  fechaCorte: string;
  esDemostracion: boolean;
  usuarios: EstadisticasUsuarios | null;
  marketplace: EstadisticasMarketplace | null;
  resenas: EstadisticasResenas | null;
  // ADMIN Marcos: se quitaron los casos de disputas (HU-24 fuera de alcance)
}
