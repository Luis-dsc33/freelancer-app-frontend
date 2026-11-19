import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoTiempoRealChat, MensajeChat } from '../models/chat';

/**
 * Puerto desacoplado de mensajería en tiempo real (DIP).
 * Permite intercambiar el adaptador HTTP preparatorio por SignalR sin tocar el ViewModel ni la View.
 */
export interface IChatRealtimePort {
  readonly estadoConexion: Signal<EstadoTiempoRealChat>;
  readonly mensajesEntrantes$: Observable<MensajeChat>;
  conectar(token: string): Promise<void>;
  unirseAConversacion(conversacionId: string): Promise<void>;
  salirDeConversacion(conversacionId: string): Promise<void>;
  desconectar(): Promise<void>;
}

export const CHAT_REALTIME_PORT =
  new InjectionToken<IChatRealtimePort>('CHAT_REALTIME_PORT');
