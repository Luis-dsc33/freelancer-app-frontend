import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonModal, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  eyeOutline,
  paperPlaneOutline,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { EstudianteNavComponent } from '../../../../shared/components/estudiante-nav/estudiante-nav.component';
import { RetirarPostulacionHandler } from '../../commands/retirar-postulacion.handler';
import { PostulacionHttpRepository } from '../../data/postulacion-http.repository';
import { POSTULACION_REPOSITORY } from '../../data/postulacion.repository';
import { EstadoPostulacion } from '../../models/postulacion';
import { ListarMisPostulacionesHandler } from '../../queries/listar-mis-postulaciones.handler';
import {
  FiltroEstadoPostulacion,
  MisPostulacionesViewModel,
} from '../../viewmodels/mis-postulaciones.view-model';

addIcons({
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  eyeOutline,
  paperPlaneOutline,
  refreshOutline,
  trashOutline,
});

@Component({
  selector: 'app-mis-postulaciones',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    IonContent,
    IonIcon,
    IonModal,
    IonSpinner,
    EstudianteNavComponent,
  ],
  templateUrl: './mis-postulaciones.page.html',
  styleUrls: ['./mis-postulaciones.page.scss'],
  providers: [
    MisPostulacionesViewModel,
    ListarMisPostulacionesHandler,
    RetirarPostulacionHandler,
    { provide: POSTULACION_REPOSITORY, useClass: PostulacionHttpRepository },
  ],
})
export class MisPostulacionesPage {
  readonly vm = inject(MisPostulacionesViewModel);
  readonly filtros: readonly FiltroEstadoPostulacion[] = [
    'Todas',
    'Pendiente',
    'Aceptada',
    'Rechazada',
    'Retirada',
  ];

  ionViewWillEnter(): void {
    this.vm.cargar();
  }

  cerrarModal = (): boolean => !this.vm.procesandoId();

  claseEstado(estado: EstadoPostulacion): string {
    switch (estado) {
      case 'Aceptada':
        return 'accepted';
      case 'Rechazada':
      case 'Retirada':
        return 'rejected';
      default:
        return 'pending';
    }
  }
}
