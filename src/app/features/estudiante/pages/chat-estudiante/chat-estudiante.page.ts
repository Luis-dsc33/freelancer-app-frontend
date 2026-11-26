import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  paperPlaneOutline,
  refreshOutline,
  radioOutline,
} from 'ionicons/icons';
import { EstudianteNavComponent } from '../../../../shared/components/estudiante-nav/estudiante-nav.component';
import { AbrirConversacionHandler } from '../../commands/abrir-conversacion.handler';
import { EnviarMensajeChatHandler } from '../../commands/enviar-mensaje-chat.handler';
import { ChatHttpRepository } from '../../data/chat-http.repository';
import { ChatSignalRAdapter } from '../../data/chat-signalr.adapter';
import { CHAT_REALTIME_PORT } from '../../data/chat-realtime.port';
import { CHAT_REPOSITORY } from '../../data/chat.repository';
import { EstadoTiempoRealChat } from '../../models/chat';
import { ListarMensajesConversacionHandler } from '../../queries/listar-mensajes-conversacion.handler';
import { ListarMisConversacionesHandler } from '../../queries/listar-mis-conversaciones.handler';
import { ChatEstudianteViewModel } from '../../viewmodels/chat-estudiante.view-model';

addIcons({
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  paperPlaneOutline,
  refreshOutline,
  radioOutline,
});

@Component({
  selector: 'app-chat-estudiante',
  standalone: true,
  imports: [DatePipe, RouterLink, IonContent, IonIcon, IonSpinner, EstudianteNavComponent],
  templateUrl: './chat-estudiante.page.html',
  styleUrls: ['./chat-estudiante.page.scss'],
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
export class ChatEstudiantePage {
  readonly vm = inject(ChatEstudianteViewModel);
  private readonly route = inject(ActivatedRoute);

  ionViewWillEnter(): void {
    const params = this.route.snapshot.queryParamMap;
    const proyectoId = params.get('proyectoId');
    const postulacionId = params.get('postulacionId');
    const contratoId = params.get('contratoId');

    this.vm.cargar(
      proyectoId
        ? { proyectoId, postulacionId, contratoId }
        : null,
    );
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
