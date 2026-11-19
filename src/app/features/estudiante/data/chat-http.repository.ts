import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AbrirConversacionRequest,
  ConversacionChat,
  EnviarMensajeRequest,
  MensajeChat,
} from '../models/chat';
import { IChatRepository } from './chat.repository';

/** Adaptador HTTP hacia Chat.Api. */
@Injectable()
export class ChatHttpRepository implements IChatRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gatewayUrl}/api/chat/conversaciones`;

  listarMisConversaciones(): Observable<ConversacionChat[]> {
    return this.http.get<ConversacionChat[]>(`${this.baseUrl}/mias`);
  }

  abrirConversacion(request: AbrirConversacionRequest): Observable<ConversacionChat> {
    return this.http.post<ConversacionChat>(this.baseUrl, request);
  }

  listarMensajes(conversacionId: string): Observable<MensajeChat[]> {
    return this.http.get<MensajeChat[]>(
      `${this.baseUrl}/${encodeURIComponent(conversacionId)}/mensajes`,
    );
  }

  enviarMensaje(conversacionId: string, request: EnviarMensajeRequest): Observable<MensajeChat> {
    return this.http.post<MensajeChat>(
      `${this.baseUrl}/${encodeURIComponent(conversacionId)}/mensajes`,
      request,
    );
  }
}
