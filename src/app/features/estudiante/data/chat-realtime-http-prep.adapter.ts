import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  ChatConectadoDto,
  ChatConexionDto,
  EstadoTiempoRealChat,
  MensajeChat,
} from '../models/chat';
import { IChatRealtimePort } from './chat-realtime.port';

/**
 * Adaptador de respaldo sin tiempo real: la UI sigue funcionando únicamente con REST.
 * El adaptador principal es `ChatSignalRAdapter`.
 */
@Injectable()
export class ChatRealtimeHttpPrepAdapter implements IChatRealtimePort {
  private readonly mensajesSubject = new Subject<MensajeChat>();
  private readonly conectadoSubject = new Subject<ChatConectadoDto>();
  private readonly participanteSubject = new Subject<ChatConexionDto>();

  readonly estadoConexion = signal<EstadoTiempoRealChat>('desconectado');
  readonly mensajesEntrantes$: Observable<MensajeChat> = this.mensajesSubject.asObservable();
  readonly conectado$: Observable<ChatConectadoDto> = this.conectadoSubject.asObservable();
  readonly participanteConectado$: Observable<ChatConexionDto> =
    this.participanteSubject.asObservable();

  async conectar(token: string): Promise<void> {
    this.estadoConexion.set(token ? 'modo_http' : 'desconectado');
  }

  async unirseAConversacion(_conversacionId: string): Promise<void> {
    // Sin Hub: no hay sala a la que unirse.
  }

  async salirDeConversacion(_conversacionId: string): Promise<void> {
    // Sin Hub: no hay sala de la que salir.
  }

  async desconectar(): Promise<void> {
    this.estadoConexion.set('desconectado');
  }
}
