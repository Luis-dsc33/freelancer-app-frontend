import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  flashOutline,
  funnelOutline,
  locationOutline,
  peopleOutline,
  refreshOutline,
  searchOutline,
  sparklesOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { EstudianteNavComponent } from '../../../../shared/components/estudiante-nav/estudiante-nav.component';
import { PerfilEstudianteHttpRepository } from '../../../usuarios/data/perfil-estudiante-http.repository';
import { PERFIL_ESTUDIANTE_REPOSITORY } from '../../../usuarios/data/perfil-estudiante.repository';
import { ObtenerMiPerfilHandler } from '../../../usuarios/queries/obtener-mi-perfil.handler';
import { OportunidadProyectoHttpRepository } from '../../data/oportunidad-proyecto-http.repository';
import { OPORTUNIDAD_PROYECTO_REPOSITORY } from '../../data/oportunidad-proyecto.repository';
import { ListarOportunidadesHandler } from '../../queries/listar-oportunidades.handler';
import { MarketplaceViewModel } from '../../viewmodels/marketplace.view-model';

addIcons({
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  flashOutline,
  funnelOutline,
  locationOutline,
  peopleOutline,
  refreshOutline,
  searchOutline,
  sparklesOutline,
  storefrontOutline,
});

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    IonContent,
    IonIcon,
    IonSpinner,
    EstudianteNavComponent,
  ],
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss'],
  providers: [
    MarketplaceViewModel,
    ListarOportunidadesHandler,
    ObtenerMiPerfilHandler,
    { provide: OPORTUNIDAD_PROYECTO_REPOSITORY, useClass: OportunidadProyectoHttpRepository },
    { provide: PERFIL_ESTUDIANTE_REPOSITORY, useClass: PerfilEstudianteHttpRepository },
  ],
})
export class MarketplacePage {
  /** View del MVVM: solo enlaza UI al ViewModel. */
  readonly vm = inject(MarketplaceViewModel);
  readonly filtrosVisibles = signal(false);

  ionViewWillEnter(): void {
    this.vm.cargar();
  }

  actualizarNumero(destino: 'min' | 'max', raw: string): void {
    const valor = raw.trim() === '' ? null : Number(raw);
    const numero = valor !== null && Number.isFinite(valor) && valor >= 0 ? valor : null;
    if (destino === 'min') {
      this.vm.presupuestoMin.set(numero);
    } else {
      this.vm.presupuestoMax.set(numero);
    }
  }
}
