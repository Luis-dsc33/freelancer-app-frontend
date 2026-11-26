import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  paperPlaneOutline,
  radioOutline,
  refreshOutline,
} from 'ionicons/icons';
import { AbrirConversacionHandler } from '../../../estudiante/commands/abrir-conversacion.handler';
import { EnviarMensajeChatHandler } from '../../../estudiante/commands/enviar-mensaje-chat.handler';
import { ChatHttpRepository } from '../../../estudiante/data/chat-http.repository';
import { CHAT_REALTIME_PORT } from '../../../estudiante/data/chat-realtime.port';
import { ChatSignalRAdapter } from '../../../estudiante/data/chat-signalr.adapter';
import { CHAT_REPOSITORY } from '../../../estudiante/data/chat.repository';
import { EstadoTiempoRealChat } from '../../../estudiante/models/chat';
import { ListarMensajesConversacionHandler } from '../../../estudiante/queries/listar-mensajes-conversacion.handler';
import { ListarMisConversacionesHandler } from '../../../estudiante/queries/listar-mis-conversaciones.handler';
import { ChatEstudianteViewModel } from '../../../estudiante/viewmodels/chat-estudiante.view-model';
import { ClienteLayoutComponent } from '../../components/cliente-layout/cliente-layout.component';

addIcons({
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  paperPlaneOutline,
  radioOutline,
  refreshOutline,
});

/**
 * Chat del Cliente. Reutiliza el ViewModel, los handlers CQRS y el adaptador SignalR del chat
 * (la lógica es idéntica para ambos roles; solo cambia la vista).
 */
@Component({
  selector: 'app-chat-cliente',
  standalone: true,
  imports: [DatePipe, RouterLink, IonIcon, IonSpinner, ClienteLayoutComponent],
  templateUrl: './chat-cliente.page.html',
  styleUrls: ['./chat-cliente.page.scss'],
  providers: [
    ChatEstudianteViewModel,
    ListarMisConversacionesHandler,
    ListarMensajesConversacionHandler,
    AbrirConversacionHandler,
    EnviarMensajeChatHandler,
    { provide: CHAT_REPOSITORY, useClass: ChatHttpRepository },
    { provide: CHAT_REALTIME_PORT, useClass: ChatSignalRAdapter },
  ],
})
export class ChatClientePage {
  readonly vm = inject(ChatEstudianteViewModel);
  private readonly route = inject(ActivatedRoute);

  ionViewWillEnter(): void {
    const params = this.route.snapshot.queryParamMap;
    const proyectoId = params.get('proyectoId');
    const postulacionId = params.get('postulacionId');
    const contratoId = params.get('contratoId');

    this.vm.cargar(proyectoId ? { proyectoId, postulacionId, contratoId } : null);
  }

  etiquetaEstadoConexion(estado: EstadoTiempoRealChat): string {
    switch (estado) {
      case 'conectado':
        return 'Tiempo real conectado';
      case 'conectando':
        return 'Conectando…';
      case 'modo_http':
        return 'Solo mensajes por HTTP (sin tiempo real)';
      default:
        return 'Desconectado';
    }
  }
}
