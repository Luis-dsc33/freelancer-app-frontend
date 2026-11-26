import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChatConectadoDto,
  ChatConexionDto,
  EstadoTiempoRealChat,
  MensajeChat,
} from '../models/chat';

/**
 * Puerto desacoplado de mensajería en tiempo real (DIP).
 * Implementaciones: `ChatSignalRAdapter` (Hub `/api/chat/hubs/chat`) y
 * `ChatRealtimeHttpPrepAdapter` (respaldo sin tiempo real).
 */
export interface IChatRealtimePort {
  readonly estadoConexion: Signal<EstadoTiempoRealChat>;
  readonly mensajesEntrantes$: Observable<MensajeChat>;
  /** Evento `Conectado`: confirmación del Hub para el socket recién abierto. */
  readonly conectado$: Observable<ChatConectadoDto>;
  /** Evento `ParticipanteConectado`: alguien (tú o la contraparte) entró a la sala. */
  readonly participanteConectado$: Observable<ChatConexionDto>;
  conectar(token: string): Promise<void>;
  unirseAConversacion(conversacionId: string): Promise<void>;
  salirDeConversacion(conversacionId: string): Promise<void>;
  desconectar(): Promise<void>;
}

export const CHAT_REALTIME_PORT =
  new InjectionToken<IChatRealtimePort>('CHAT_REALTIME_PORT');
