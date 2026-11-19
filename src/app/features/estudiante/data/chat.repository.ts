import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AbrirConversacionRequest,
  ConversacionChat,
  EnviarMensajeRequest,
  MensajeChat,
} from '../models/chat';

/** Abstracción de acceso HTTP al historial y envío de mensajes en Chat.Api (DIP). */
export interface IChatRepository {
  listarMisConversaciones(): Observable<ConversacionChat[]>;
  abrirConversacion(request: AbrirConversacionRequest): Observable<ConversacionChat>;
  listarMensajes(conversacionId: string): Observable<MensajeChat[]>;
  enviarMensaje(conversacionId: string, request: EnviarMensajeRequest): Observable<MensajeChat>;
}

export const CHAT_REPOSITORY =
  new InjectionToken<IChatRepository>('CHAT_REPOSITORY');
