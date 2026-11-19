import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  briefcaseOutline,
  calendarOutline,
  checkmarkCircleOutline,
  flashOutline,
  locationOutline,
  paperPlaneOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  timeOutline,
} from 'ionicons/icons';
import { EstudianteNavComponent } from '../../../../shared/components/estudiante-nav/estudiante-nav.component';
import { PostularAOfertaHandler } from '../../../estudiante/commands/postular-a-oferta.handler';
import { PostulacionHttpRepository } from '../../../estudiante/data/postulacion-http.repository';
import { POSTULACION_REPOSITORY } from '../../../estudiante/data/postulacion.repository';
import { PerfilEstudianteHttpRepository } from '../../../usuarios/data/perfil-estudiante-http.repository';
import { PERFIL_ESTUDIANTE_REPOSITORY } from '../../../usuarios/data/perfil-estudiante.repository';
import { ObtenerMiPerfilHandler } from '../../../usuarios/queries/obtener-mi-perfil.handler';
import { OportunidadProyectoHttpRepository } from '../../data/oportunidad-proyecto-http.repository';
import { OPORTUNIDAD_PROYECTO_REPOSITORY } from '../../data/oportunidad-proyecto.repository';
import { ObtenerDetalleOportunidadHandler } from '../../queries/obtener-detalle-oportunidad.handler';
import { DetalleOportunidadViewModel } from '../../viewmodels/detalle-oportunidad.view-model';

addIcons({
  alertCircleOutline,
  arrowBackOutline,
  briefcaseOutline,
  calendarOutline,
  checkmarkCircleOutline,
  flashOutline,
  locationOutline,
  paperPlaneOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  timeOutline,
});

@Component({
  selector: 'app-detalle-oportunidad',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    IonContent,
    IonIcon,
    IonSpinner,
    EstudianteNavComponent,
  ],
  templateUrl: './detalle-oportunidad.page.html',
  styleUrls: ['./detalle-oportunidad.page.scss'],
  providers: [
    DetalleOportunidadViewModel,
    ObtenerDetalleOportunidadHandler,
    PostularAOfertaHandler,
    ObtenerMiPerfilHandler,
    { provide: OPORTUNIDAD_PROYECTO_REPOSITORY, useClass: OportunidadProyectoHttpRepository },
    { provide: POSTULACION_REPOSITORY, useClass: PostulacionHttpRepository },
    { provide: PERFIL_ESTUDIANTE_REPOSITORY, useClass: PerfilEstudianteHttpRepository },
  ],
})
export class DetalleOportunidadPage {
  readonly vm = inject(DetalleOportunidadViewModel);
  private readonly route = inject(ActivatedRoute);
  readonly mensajePropuesta = signal('');

  ionViewWillEnter(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.mensajePropuesta.set('');
    this.vm.cargar(id);
  }

  enviarPostulacion(): void {
    this.vm.postularse(this.mensajePropuesta());
  }
}
