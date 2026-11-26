import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ChatConectadoDto,
  ChatConexionDto,
  EstadoTiempoRealChat,
  MensajeChat,
} from '../models/chat';
import { IChatRealtimePort } from './chat-realtime.port';

/**
 * Adaptador SignalR contra `Chat.Api` (vía gateway: `/api/chat/hubs/chat`).
 *
 * Reglas del contrato (Sprint 8):
 * - Los listeners (`Conectado`, `ParticipanteConectado`, `MensajeRecibido`) se registran ANTES de `start()`.
 * - Al reconectar se vuelve a ejecutar `JoinConversation` (cada reconexión genera un `connectionId` nuevo).
 * - Si el Hub no está disponible, la UI continúa en `modo_http` (solo REST).
 */
@Injectable()
export class ChatSignalRAdapter implements IChatRealtimePort {
  private readonly hubUrl = `${environment.gatewayUrl}/api/chat/hubs/chat`;
  private connection?: signalR.HubConnection;
  private conversacionActivaId: string | null = null;

  private readonly mensajesSubject = new Subject<MensajeChat>();
  private readonly conectadoSubject = new Subject<ChatConectadoDto>();
  private readonly participanteSubject = new Subject<ChatConexionDto>();

  readonly estadoConexion = signal<EstadoTiempoRealChat>('desconectado');
  readonly mensajesEntrantes$: Observable<MensajeChat> = this.mensajesSubject.asObservable();
  readonly conectado$: Observable<ChatConectadoDto> = this.conectadoSubject.asObservable();
  readonly participanteConectado$: Observable<ChatConexionDto> =
    this.participanteSubject.asObservable();

  async conectar(token: string): Promise<void> {
    if (!token) {
      this.estadoConexion.set('desconectado');
      return;
    }
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    this.estadoConexion.set('conectando');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        // El cliente SignalR lo envía como `?access_token=<JWT>` en WebSockets/SSE.
        accessTokenFactory: () => this.leerTokenActual() || token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    this.connection = connection;

    // IMPORTANTE: registrar listeners ANTES de llamar a start().
    connection.on('Conectado', (payload: ChatConectadoDto) => this.conectadoSubject.next(payload));
    connection.on('ParticipanteConectado', (payload: ChatConexionDto) =>
      this.participanteSubject.next(payload),
    );
    connection.on('MensajeRecibido', (mensaje: MensajeChat) => this.mensajesSubject.next(mensaje));

    connection.onreconnecting(() => this.estadoConexion.set('conectando'));
    connection.onreconnected(async () => {
      this.estadoConexion.set('conectado');
      if (this.conversacionActivaId) {
        await this.invocarJoin(this.conversacionActivaId);
      }
    });
    connection.onclose(() => {
      if (this.connection === connection) {
        this.estadoConexion.set('desconectado');
      }
    });

    try {
      await connection.start();
      if (this.connection !== connection) return;
      this.estadoConexion.set('conectado');
      if (this.conversacionActivaId) {
        await this.invocarJoin(this.conversacionActivaId);
      }
    } catch {
      if (this.connection === connection) {
        this.connection = undefined;
        this.estadoConexion.set('modo_http');
      }
    }
  }

  async unirseAConversacion(conversacionId: string): Promise<void> {
    this.conversacionActivaId = conversacionId;
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.invocarJoin(conversacionId);
    }
  }

  async salirDeConversacion(conversacionId: string): Promise<void> {
    if (this.conversacionActivaId === conversacionId) {
      this.conversacionActivaId = null;
    }
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveConversation', conversacionId);
      } catch {
        // Salir de una sala nunca debe interrumpir la navegación.
      }
    }
  }

  async desconectar(): Promise<void> {
    this.conversacionActivaId = null;
    const connection = this.connection;
    this.connection = undefined;
    this.estadoConexion.set('desconectado');
    try {
      await connection?.stop();
    } catch {
      // Ignorar errores al cerrar.
    }
  }

  private async invocarJoin(conversacionId: string): Promise<void> {
    try {
      await this.connection?.invoke('JoinConversation', conversacionId);
    } catch {
      // HubException si no eres participante: el historial REST seguirá funcionando.
    }
  }

  private leerTokenActual(): string {
    try {
      return localStorage.getItem('jwt_token') ?? '';
    } catch {
      return '';
    }
  }
}
