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

export type EstadoTiempoRealChat = 'desconectado' | 'conectando' | 'conectado' | 'modo_http';
