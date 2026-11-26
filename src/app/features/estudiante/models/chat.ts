export interface ConversacionChat {
  id: string;
  proyectoId: string;
  tituloProyecto?: string;
  postulacionId?: string | null;
  contratoId?: string | null;
  clienteId: string;
  estudianteId: string;
  nombreContraparte?: string;
  ultimoMensaje?: string | null;
  ultimaActividadEn?: string | null;
  noLeidos?: number;
}

export interface MensajeChat {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  enviadoEn: string;
}

export interface AbrirConversacionRequest {
  proyectoId: string;
  postulacionId?: string | null;
  contratoId?: string | null;
}

export interface EnviarMensajeRequest {
  contenido: string;
}

/** Evento `Conectado` (solo para el socket recién conectado). */
export interface ChatConectadoDto {
  usuarioId: string;
  connectionId: string;
  conectadoEn: string;
}

/** Evento `ParticipanteConectado` (a todos los miembros de la sala al ejecutar `JoinConversation`). */
export interface ChatConexionDto {
  usuarioId: string;
  conversacionId: string;
  connectionId: string;
  conectadoEn: string;
}

export type EstadoTiempoRealChat = 'desconectado' | 'conectando' | 'conectado' | 'modo_http';
