import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EstadoTiempoRealChat, MensajeChat } from '../models/chat';
import { IChatRealtimePort } from './chat-realtime.port';

/**
 * Adaptador desacoplado mientras se habilita el Hub SignalR en Chat.Api.
 * Cuando se instale `@microsoft/signalr`, basta sustituir este provider por `ChatSignalRAdapter`
 * implementando `IChatRealtimePort` contra `${gatewayUrl}/api/chat/hubs/chat`.
 */
@Injectable()
export class ChatRealtimeHttpPrepAdapter implements IChatRealtimePort {
  private readonly mensajesSubject = new Subject<MensajeChat>();

  readonly estadoConexion = signal<EstadoTiempoRealChat>('desconectado');
  readonly mensajesEntrantes$: Observable<MensajeChat> = this.mensajesSubject.asObservable();

  async conectar(token: string): Promise<void> {
    if (!token) {
      this.estadoConexion.set('desconectado');
      return;
    }
    this.estadoConexion.set('modo_http');
  }

  async unirseAConversacion(_conversacionId: string): Promise<void> {
    // El adaptador SignalR invocará `JoinConversation(conversacionId)` aquí.
  }

  async salirDeConversacion(_conversacionId: string): Promise<void> {
    // El adaptador SignalR invocará `LeaveConversation(conversacionId)` aquí.
  }

  async desconectar(): Promise<void> {
    this.estadoConexion.set('desconectado');
  }
}
